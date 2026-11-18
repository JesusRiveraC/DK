
/*
 * DK - BASE DE PRECIOS BOCASION
 * Precios unitarios en soles (S/)
 *
 * Los productos sin coincidencia segura serán marcados
 * como REVISAR. No se inventarán precios.
 */

const PRICE_LIST = [
    { name: "CREMA VOLTEADA", price: 4.50 },
    { name: "CHEESECAKE DE MARACUYA", price: 4.50 },
    { name: "CHEESECAKE DE FRESA", price: 4.50 },
    { name: "CROCANTE DE MANZANA", price: 4.50 },
    { name: "PIE DE LIMON", price: 4.50 },
    { name: "PIE DE MARACUYA", price: 4.50 },

    { name: "TORTA RED VELVET", price: 5.00 },
    { name: "TORTA DE MOKA", price: 4.50 },
    { name: "TORTA DE CHOCOLATE", price: 4.50 },
    { name: "TORTA SELVA NEGRA", price: 4.50 },
    { name: "TORTA TRES LECHES", price: 5.00 },
    { name: "TORTA DE ZANAHORIA", price: 5.00 },
    { name: "TORTA HELADA", price: 5.00 },
    { name: "TORTA SUBLIME", price: 4.50 },
    { name: "TORTA VAINILLA MANJAR", price: 4.50 },

    { name: "MILHOJAS DE FRESA", price: 4.50 },
    { name: "MILHOJAS DE MANJAR", price: 4.50 },

    { name: "KEKE DE ZANAHORIA PORCION", price: 5.00 },
    { name: "KEKE DE ZANAHORIA ENTERO", price: 26.70 },

    { name: "CUCHAREABLE CHEESECAKE OREO", price: 6.00 },
    { name: "CUCHAREABLE TRES LECHES", price: 6.00 },
    { name: "CUCHAREABLE ALFAJOR", price: 6.00 },
    { name: "CUCHAREABLE CHEESECAKE DE DURAZNO", price: 6.00 },
    { name: "CUCHAREABLE CHEESECAKE FRUTOS DEL BOSQUE", price: 6.00 },
    { name: "CUCHAREABLE CHOCOLATOSO", price: 6.00 },
    { name: "CUCHAREABLE CHOCOMANJAR", price: 6.00 },
    { name: "CUCHAREABLE COOKIES AND CREAM", price: 6.00 },
    { name: "CUCHAREABLE DE CARROT CAKE", price: 6.00 },
    { name: "CUCHAREABLE DE BROWNIE", price: 6.00 },
    { name: "CUCHAREABLE DE CHOCOLUCUMA", price: 6.00 },
    { name: "CUCHAREABLE DE MILHOJAS", price: 6.00 },
    { name: "CUCHAREABLE DE MINI PROFITEROLES", price: 6.00 },
    { name: "CUCHAREABLE DE TURRON", price: 6.00 },
    { name: "CUCHAREABLE MOROCHAS", price: 6.00 },
    { name: "CUCHAREABLE PIE DE LIMON", price: 6.00 },
    { name: "CUCHAREABLE DE SUBLIME", price: 6.00 },
    { name: "CUCHAREABLE TIRAMISU", price: 6.00 },
    { name: "CUCHAREABLE TRES LECHES CHOCOLATE", price: 6.00 },
    { name: "CUCHAREABLE TRES LECHES VAINILLA", price: 6.00 },

    { name: "TARTALETA DE FRESA", price: 4.20 },
    { name: "TRUFA", price: 4.85 },

    { name: "EMPANADA DE CARNE", price: 3.50 },
    { name: "EMPANADA DE POLLO", price: 3.50 },
    { name: "EMPANADA MIXTA", price: 3.50 },

    { name: "KEKE CHOCOCHIP", price: 23.00 },
    { name: "KEKE MARMOL", price: 23.00 },
    { name: "KEKE CHOCOLATE", price: 23.00 },
    { name: "KEKE DE VAINILLA", price: 23.00 },
    { name: "KEKE DE NARANJA", price: 23.00 },
    { name: "KEKE DE MARACUYA", price: 28.70 }
];

/*
 * Normaliza nombres:
 * - Mayúsculas
 * - Sin tildes
 * - Sin signos innecesarios
 */
function normalizeProductName(name) {
    return String(name || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase()
        .replace(/\(.*?\)/g, " ")
        .replace(/\b(ST|CLASICO|CLASICA|DECORADO|PORCION|UNIDAD)\b/g, " ")
        .replace(/[^A-Z0-9 ]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/*
 * Busca el precio del producto.
 * Si no hay coincidencia segura, devuelve null.
 */
function findProductPrice(productName) {
    const normalized = normalizeProductName(productName);

    // Casos que necesitan revisión manual.
    if (
        normalized.includes("PLATANO") ||
        normalized.includes("OREO") && normalized.includes("CHEESECAKE") ||
        normalized.includes("FRESA") && normalized.includes("CUCHAREABLE") ||
        normalized.includes("ZANAHORIA") && normalized.includes("KEKE")
    ) {
        return null;
    }

    // Coincidencia exacta después de normalizar.
    const exactMatch = PRICE_LIST.find(product =>
        normalizeProductName(product.name) === normalized
    );

    if (exactMatch) {
        return exactMatch.price;
    }

    // Alias conocidos del Excel de pedidos.
    const aliases = [
        {
            includes: ["CHEESECAKE DE MARACUYA"],
            priceName: "CHEESECAKE DE MARACUYA"
        },
        {
            includes: ["CHESCAKE DE FRESA", "CHEESCAKE DE FRESA"],
            priceName: "CHEESECAKE DE FRESA"
        },
        {
            includes: ["CROCANTE DE MANZANA"],
            priceName: "CROCANTE DE MANZANA"
        },
        {
            includes: ["CREMA VOLTEADA"],
            priceName: "CREMA VOLTEADA"
        },
        {
            includes: ["EMPANADA DE CARNE"],
            priceName: "EMPANADA DE CARNE"
        },
        {
            includes: ["EMPANADA DE POLLO"],
            priceName: "EMPANADA DE POLLO"
        },
        {
            includes: ["EMPANADA MIXTA"],
            priceName: "EMPANADA MIXTA"
        },
        {
            includes: ["KEKE MARMOLEDADO", "KEKE MARMOL"],
            priceName: "KEKE MARMOL"
        },
        {
            includes: ["MIL HOJAS DE FRESA"],
            priceName: "MILHOJAS DE FRESA"
        },
        {
            includes: ["MIL HOJAS DE MANJAR"],
            priceName: "MILHOJAS DE MANJAR"
        },
        {
            includes: ["PIE DE LIMON"],
            priceName: "PIE DE LIMON"
        },
        {
            includes: ["TARTALETA DE FRESA"],
            priceName: "TARTALETA DE FRESA"
        },
        {
            includes: ["TORTA 3 LECHES CHOCOLATE"],
            priceName: "TORTA TRES LECHES"
        },
        {
            includes: ["TORTA DE CHOCOLATE"],
            priceName: "TORTA DE CHOCOLATE"
        },
        {
            includes: ["TORTA HELADA"],
            priceName: "TORTA HELADA"
        },
        {
            includes: ["TORTA MOKA"],
            priceName: "TORTA DE MOKA"
        },
        {
            includes: ["TORTA RED VELVET", "TORTA RED VELBET"],
            priceName: "TORTA RED VELVET"
        },
        {
            includes: ["TORTA SELVA NEGRA"],
            priceName: "TORTA SELVA NEGRA"
        },
        {
            includes: ["TORTA SUBLIME"],
            priceName: "TORTA SUBLIME"
        },
        {
            includes: ["TORTA TRES LECHES VLL"],
            priceName: "TORTA TRES LECHES"
        },
        {
            includes: ["TRUFA DE CHOCOLATE"],
            priceName: "TRUFA"
        },
        {
            includes: ["CUCHAREABLE ALFAJOR"],
            priceName: "CUCHAREABLE ALFAJOR"
        },
        {
            includes: ["CUCHAREABLE CHOCO MANJAR"],
            priceName: "CUCHAREABLE CHOCOMANJAR"
        },
        {
            includes: ["CUCHAREABLE CHOCOLATOSO"],
            priceName: "CUCHAREABLE CHOCOLATOSO"
        },
        {
            includes: ["CUCHAREABLE DE SUBLIME"],
            priceName: "CUCHAREABLE DE SUBLIME"
        },
        {
            includes: ["CUCHAREABLE MOROCHAS"],
            priceName: "CUCHAREABLE MOROCHAS"
        },
        {
            includes: ["CUCHAREABLE DE TRES LECHES"],
            priceName: "CUCHAREABLE TRES LECHES"
        },
        {
            includes: ["CUCHAREABLE DE CHOCO LUCUMA"],
            priceName: "CUCHAREABLE DE CHOCOLUCUMA"
        },
        {
            includes: ["CUCHAREABLE DE PIE DE LIMON"],
            priceName: "CUCHAREABLE PIE DE LIMON"
        },
        {
            includes: ["CUCHAREABLE CHOCO TRES LECHES"],
            priceName: "CUCHAREABLE TRES LECHES CHOCOLATE"
        },
        {
            includes: ["CUCHAREABLE CHOCO BROWNIE"],
            priceName: "CUCHAREABLE DE BROWNIE"
        }
    ];

    for (const alias of aliases) {
        if (alias.includes.some(term => normalized.includes(term))) {
            const match = PRICE_LIST.find(product =>
                product.name === alias.priceName
            );

            if (match) {
                return match.price;
            }
        }
    }

    return null;
}
