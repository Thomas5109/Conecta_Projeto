export function formatarNumeroTelefone(valor: string): string {
    const digitos = valor.replace(/\D/g, '').slice(0, 9);
    if (digitos.startsWith('9')) {
        if (digitos.length <= 1) return digitos;
        if (digitos.length <= 5) return digitos.slice(0, 1) + ' ' + digitos.slice(1);
        return digitos.slice(0, 1) + ' ' + digitos.slice(1, 5) + '-' + digitos.slice(5);
    }
    return digitos.length <= 4 ? digitos : digitos.slice(0, 4) + '-' + digitos.slice(4);
}

export function formatarDdd(valor: string): string {
    return valor.replace(/\D/g, '').slice(0, 2);
}

export function dividirTelefone(valor: string): { ddd: string; numero: string } {
    const digitos = valor.replace(/\D/g, '');
    return { ddd: digitos.slice(0, 2), numero: formatarNumeroTelefone(digitos.slice(2)) };
}

export function formatarTelefoneCompleto(ddd: string, numero: string): string {
    const dddLimpo = formatarDdd(ddd);
    const numeroFormatado = formatarNumeroTelefone(numero);
    return dddLimpo ? `(${dddLimpo}) ${numeroFormatado}` : numeroFormatado;
}
