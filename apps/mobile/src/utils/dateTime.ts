export function mascararDataBrasileira(valor: string): string {
    const digitos = valor.replace(/\D/g, '').slice(0, 8);
    const dia = digitos.slice(0, 2);
    const mes = digitos.slice(2, 4);
    const ano = digitos.slice(4, 8);

    if (digitos.length <= 2) return dia;
    if (digitos.length <= 4) return dia + '/' + mes;
    return dia + '/' + mes + '/' + ano;
}

export function parseDataBrasileira(valor: string): Date | null {
    const correspondencia = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(valor.trim());
    if (!correspondencia) return null;

    const [, diaTexto, mesTexto, anoTexto] = correspondencia;
    const dia = Number(diaTexto);
    const mes = Number(mesTexto);
    const ano = Number(anoTexto);
    if (ano < 1 || mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;

    const data = new Date(0);
    data.setFullYear(ano, mes - 1, dia);
    data.setHours(0, 0, 0, 0);

    return data.getFullYear() === ano &&
        data.getMonth() === mes - 1 &&
        data.getDate() === dia
        ? data
        : null;
}

export function dataBrasileiraParaISO(valor: string): string | null {
    const data = parseDataBrasileira(valor);
    if (!data) return null;

    const [dia, mes, ano] = valor.split('/');
    return ano + '-' + mes + '-' + dia;
}

export function formatarDataBrasileira(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = String(data.getFullYear()).padStart(4, '0');
    return dia + '/' + mes + '/' + ano;
}

export function mascararHorario(valor: string): string {
    const entrada = valor.replace(/[^\d:]/g, '').slice(0, 5);
    const separador = entrada.indexOf(':');

    if (separador >= 0) {
        const horas = entrada.slice(0, separador).slice(0, 2);
        const minutos = entrada.slice(separador + 1).replace(/:/g, '').slice(0, 2);
        return horas + ':' + minutos;
    }

    const digitos = entrada.replace(/\D/g, '').slice(0, 4);
    if (digitos.length <= 2) return digitos;
    if (digitos.length === 3 && digitos[0] !== '0') {
        return digitos.slice(0, 1) + ':' + digitos.slice(1);
    }
    return digitos.slice(0, 2) + ':' + digitos.slice(2);
}

export function normalizarHorario(valor: string): string | null {
    const entrada = valor.trim();
    let horasTexto: string;
    let minutosTexto: string;

    const comSeparador = /^(\d{1,2}):(\d{1,2})$/.exec(entrada);
    if (comSeparador) {
        [, horasTexto, minutosTexto] = comSeparador;
    } else if (/^\d{3,4}$/.test(entrada)) {
        const digitos = entrada;
        horasTexto = digitos.length === 3 ? digitos.slice(0, 1) : digitos.slice(0, 2);
        minutosTexto = digitos.length === 3 ? digitos.slice(1) : digitos.slice(2);
    } else {
        return null;
    }

    const horas = Number(horasTexto);
    const minutos = Number(minutosTexto);
    if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) return null;

    return String(horas).padStart(2, '0') + ':' + String(minutos).padStart(2, '0');
}

export function horarioParaDate(valor: string): Date | null {
    const horario = normalizarHorario(valor);
    if (!horario) return null;

    const [horas, minutos] = horario.split(':').map(Number);
    const data = new Date();
    data.setHours(horas, minutos, 0, 0);
    return data;
}

export function formatarHorario(data: Date): string {
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    return horas + ':' + minutos;
}

export function formatarDataHoraExibicao(valor: string): string {
    const dataSemHorario = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor.trim());
    if (dataSemHorario) {
        const [, ano, mes, dia] = dataSemHorario;
        const dataBrasileira = dia + '/' + mes + '/' + ano;
        return parseDataBrasileira(dataBrasileira) ? dataBrasileira : valor;
    }

    if (/^\d{4}-\d{2}-\d{2}[T ]/.test(valor)) {
        const data = new Date(valor.includes('T') ? valor : valor.replace(' ', 'T'));
        if (!Number.isNaN(data.getTime())) {
            return data.toLocaleString('pt-BR');
        }
    }

    return valor;
}

