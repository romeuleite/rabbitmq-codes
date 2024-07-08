function funcao1(a) {
    const f2res = funcao2(a);

    return f2res * 5;
}

function funcao2(a) {
    const f3res = funcao3(a);

    return f3res + 1;
}

function funcao3(a) {
    const f4res = funcao4(a);

    return f4res / 5;
}

function funcao4(a) {
    const f5res = funcao5(a);

    return f5res + 3;
}

function funcao5(a) {
    return a * 2;
}