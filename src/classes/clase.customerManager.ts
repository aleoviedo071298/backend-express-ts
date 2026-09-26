import crypto from "crypto"
import { arrayCustomers, customersPath, guardarJSON } from "../data.js"
import type { Customer } from "../data.js"
import { AuthUtils } from "./clase.AuthUtils.js"
export type CustomerPublico = Omit<Customer, "password" | "token">
export type DatosCustomer = Pick<Customer, "nombre" | "email" | "password">

export type ResultadoCustomer =
    | { ok: true, customer: CustomerPublico }
    | { ok: false, motivo: "no_encontrado" | "email_duplicado" }

export type ResultadoLogin = { customer: CustomerPublico, token: string }

export class CustomerManager {
    //quita password y token antes de devolver un customer
    private static aPublico = ({ password, token, ...resto }: Customer): CustomerPublico => resto

    private static normalizarEmail = (email: string): string => email.trim().toLowerCase()

    private static buscarPorEmail = (email: string): Customer | undefined => {
        const emailNormalizado = CustomerManager.normalizarEmail(email)
        return arrayCustomers.find(cus => cus.email === emailNormalizado)
    }

    //devuelve todos los customers
    static obtenerTodos = (): CustomerPublico[] => arrayCustomers.map(CustomerManager.aPublico)

    //busca un customer por su id
    static obtenerPorId = (id: string): CustomerPublico | undefined => {
        const customer = arrayCustomers.find(cus => cus.id === id)
        return customer && CustomerManager.aPublico(customer)
    }

    //crea un customer con id UUID, password hasheada y token vacio (se completa en el primer login), y lo persiste
    static crear = async (datos: DatosCustomer): Promise<ResultadoCustomer> => {
        const email = CustomerManager.normalizarEmail(datos.email)
        if (CustomerManager.buscarPorEmail(email)) return { ok: false, motivo: "email_duplicado" }
        const nuevoCustomer: Customer = {
            id: await AuthUtils.createUUid(),
            nombre: datos.nombre,
            email,
            password: await AuthUtils.hashPassword(datos.password),
            token: ""
        }
        arrayCustomers.push(nuevoCustomer)
        guardarJSON(customersPath, arrayCustomers)
        return { ok: true, customer: CustomerManager.aPublico(nuevoCustomer) }
    }

    //actualiza un customer existente (rehashea la password)
    static actualizar = async (id: string,datos: DatosCustomer): Promise<ResultadoCustomer> => {
        const customer = arrayCustomers.find(cus => cus.id === id)
        if (!customer) return { ok: false, motivo: "no_encontrado" }
        const email = CustomerManager.normalizarEmail(datos.email)
        const otro = CustomerManager.buscarPorEmail(email)
        if (otro && otro.id !== id) return { ok: false, motivo: "email_duplicado" }
        customer.nombre = datos.nombre
        customer.email = email
        customer.password = await AuthUtils.hashPassword(datos.password)
        guardarJSON(customersPath, arrayCustomers)
        return { ok: true, customer: CustomerManager.aPublico(customer) }
    }

    //elimina un customer; devuelve false si no existe
    static eliminar = (id: string): boolean => {
        const indice = arrayCustomers.findIndex(cus => cus.id === id)
        if (indice === -1) return false
        arrayCustomers.splice(indice, 1)
        guardarJSON(customersPath, arrayCustomers)
        return true
    }

    //valida credenciales, genera el token, lo guarda en el customer y lo persiste; undefined si no coinciden
    static login = async (email: string, password: string): Promise<ResultadoLogin | undefined> => {
        const customer = CustomerManager.buscarPorEmail(email)
        if (!customer) return undefined
        const coincide = await AuthUtils.comparePassword(password, customer.password)
        if (!coincide) return undefined
        customer.token = CustomerManager.generateToken(customer.id, customer.nombre, customer.email)
        guardarJSON(customersPath, arrayCustomers)
        return { customer: CustomerManager.aPublico(customer), token: customer.token }
    }

    //genera token "payload.firma": payload en base64url + HMAC-SHA512 con SECRET_ENCRYPTION
    static generateToken(customerId: string, customerName: string, customerEmail: string): string {
        const secret = process.env.SECRET_ENCRYPTION || ""
        const dataToEncode = JSON.stringify({ customerId, customerName, customerEmail })
        const payload = Buffer.from(dataToEncode).toString("base64url")
        const hash = crypto.createHmac("sha512", secret).update(payload).digest("hex")
        return `${payload}.${hash}`
    }

    //valida que la firma del token coincida con el payload
    static async validateToken(
        token: string,
        secret: string = process.env.SECRET_ENCRYPTION || ""
    ): Promise<{ success: boolean; message: string }> {
        if (!secret) return { success: false, message: "Secret no configurado" }
        const partes = (token ?? "").split(".")
        if (partes.length !== 2 || !partes[0] || !partes[1]) {
            return { success: false, message: "Formato de token inválido" }
        }
        const [payload, hash] = partes
        const esperado = crypto.createHmac("sha512", secret).update(payload).digest("hex")
        const hashBuf = Buffer.from(hash)
        const esperadoBuf = Buffer.from(esperado)
        if (hashBuf.length !== esperadoBuf.length || !crypto.timingSafeEqual(hashBuf, esperadoBuf)) {
            return { success: false, message: "Firma de token inválida" }
        }
        return { success: true, message: "Token válido" }
    }
}
