const isaacIcon = [0x0, 0xE6, 0xB7, 0x0, 0xB6, 0x53, 0x55, 0x5, 0x40, 0x97, 0x6E, 0x0, 0xBA, 0xD3, 0xA2, 0x1A, 0x8, 0xBA, 0x15, 0x8D, 0x86, 0x92, 0x88, 
    0x14, 0xE9, 0xFF, 0xC, 0x3A, 0x95, 0x1A, 0xAA, 0xD2, 0x55, 0x15, 0x89, 0xE9, 0x51, 0xC5, 0x5F, 0x76, 0x51, 0x66, 0x67, 0xCC, 0xAC, 0x6A, 0x49, 0x57, 
    0xEF, 0xD4, 0x4C, 0xED, 0x7F, 0xD5, 0x3A, 0xA6, 0x8F, 0x74, 0xE6, 0xBF, 0x92, 0xAA, 0xCE, 0x40, 0xF4, 0x94, 0x54, 0x69, 0x60, 0xB, 0xA4, 0x0, 0x2, 
    0x2, 0x0, 0x0, 0xFF, 0xFF];

const garetIcon = [0x0, 0x0, 0xA0, 0xF3, 0x2B, 0x15, 0x40, 0xA9, 0x20, 0x93, 0x86, 0xEE, 0xBF, 0x5B, 0xA8, 0x9E, 0xC5, 0x74, 0x2C, 0x62, 0xB2, 0x4B, 0x31, 
    0x5D, 0xB6, 0x8B, 0x41, 0x2A, 0x3A, 0x12, 0x95, 0x46, 0x77, 0x27, 0x91, 0x24, 0x33, 0x58, 0xB3, 0x41, 0x52, 0x9A, 0x3F, 0x25, 0x20, 0xA2, 0x44, 0xE5, 
    0xBF, 0xFF, 0x4A, 0xAA, 0x3A, 0x86, 0xD0, 0xFF, 0x95, 0x54, 0xD1, 0x30, 0xD5, 0x53, 0x52, 0xD5, 0x3, 0xA4, 0x40, 0xA, 0x20, 0x20, 0x0, 0x0, 0xF0, 0xFF];

const ivanIcon = [0x0, 0x0, 0x0, 0x43, 0x0, 0x90, 0x29, 0x0, 0xFC, 0x56, 0x57, 0xA5, 0x1, 0xD2, 0x20, 0x5, 0x74, 0x23, 0x21, 0x5, 0x5, 0x15, 0xFF, 0x85, 
    0x46, 0x3A, 0x9D, 0x9, 0x15, 0x43, 0x26, 0x9D, 0xFA, 0x4B, 0xE9, 0xD4, 0xB0, 0xD5, 0x53, 0x56, 0xB4, 0xD4, 0x4A, 0x33, 0xFF, 0xB5, 0xD4, 0x4E, 0x66, 
    0xA9, 0xCE, 0xFC, 0xB7, 0x52, 0x35, 0xB3, 0x50, 0x3D, 0x5B, 0x52, 0xD5, 0x3, 0x3C, 0xD, 0x52, 0x0, 0x1, 0x1, 0x0, 0x80, 0xFF, 0xFF];

const miaIcon = [0x0, 0x0, 0x0, 0x0, 0xF0, 0x9F, 0x7, 0x51, 0x80, 0xFC, 0x97, 0xAF, 0x2A, 0x69, 0xC0, 0xFC, 0xE4, 0x3F, 0x49, 0x6E, 0x40, 0x4F, 0x4F, 0x77, 
    0x75, 0xF5, 0xC0, 0xD4, 0xDC, 0xFE, 0x2B, 0xD5, 0xB3, 0x87, 0xD4, 0x3C, 0xCF, 0xBF, 0x52, 0xFD, 0xDC, 0x83, 0xE7, 0xDD, 0xBC, 0x48, 0xA5, 0x87, 0x79, 
    0x6F, 0xD3, 0x48, 0xA5, 0x7B, 0x44, 0xE5, 0x7D, 0x4A, 0xAA, 0x3A, 0x86, 0xD0, 0x5B, 0x52, 0x45, 0xA3, 0xAF, 0xA7, 0x4B, 0xAA, 0xBA, 0x7, 0xB1, 0x3, 
    0x52, 0x1A, 0x92, 0x2, 0xA9, 0x0, 0x0, 0xF0, 0xFF];

const felixIcon = [0x0, 0xF0, 0x17, 0x0, 0xC8, 0x5F, 0x1, 0xD4, 0x3F, 0x49, 0x14, 0x40, 0xA0, 0xA3, 0x80, 0x54, 0x48, 0x24, 0x5, 0xA5, 0x92, 0x48, 0x5C, 
    0x35, 0x52, 0x8D, 0xA2, 0xA4, 0x89, 0x92, 0xAE, 0x84, 0x98, 0x91, 0x69, 0xFF, 0x14, 0xAB, 0x4D, 0x56, 0xD, 0x2B, 0x23, 0xD1, 0x35, 0xD2, 0x99, 0xFF, 
    0xFE, 0xAB, 0xD6, 0x99, 0xDC, 0x51, 0x6B, 0xA7, 0xA4, 0xAA, 0xD, 0x52, 0x7A, 0x4A, 0xAA, 0xF4, 0x20, 0xD9, 0x6, 0xE9, 0x1D, 0xA0, 0x41, 0x74, 0x0, 
    0x80, 0xC4, 0xFF];

const jennaIcon = [0x0, 0x0, 0x0, 0x0, 0xE0, 0xEF, 0x67, 0xA4, 0x1A, 0x20, 0xDD, 0x27, 0xD5, 0x3, 0x88, 0xFA, 0x93, 0xD2, 0x40, 0xF1, 0xB4, 0x69, 0x6, 
    0xFE, 0xA9, 0x93, 0x48, 0xA4, 0x1A, 0x3B, 0xDC, 0x49, 0x71, 0x8B, 0x35, 0xFD, 0xF, 0x52, 0xE9, 0x61, 0xAA, 0xB7, 0x1A, 0xA9, 0xAD, 0x5E, 0x79, 0x6E, 
    0xFE, 0xFB, 0x6F, 0xA5, 0x7A, 0x76, 0x8F, 0x7C, 0xB9, 0x29, 0xA9, 0xEA, 0xC, 0x44, 0x4F, 0x49, 0x95, 0x6, 0xA6, 0x40, 0xA, 0x20, 0x20, 0x0, 0x0, 
    0xF0, 0xFF];

const shebaIcon = [0x0, 0x0, 0x0, 0x0, 0xC0, 0x2F, 0x2, 0x20, 0xC, 0x51, 0x40, 0x8A, 0x4D, 0xA2, 0x1A, 0xAA, 0x11, 0x42, 0xA, 0x29, 0x0, 0x8A, 0xAA, 0xFF, 
    0x10, 0x41, 0x69, 0x69, 0x1D, 0x11, 0x9, 0x2D, 0x74, 0x92, 0x24, 0x49, 0x94, 0x50, 0xE3, 0x4F, 0x54, 0xCB, 0x48, 0x65, 0xF6, 0x9F, 0x92, 0xAA, 0x9E, 
    0x2C, 0xA9, 0x9E, 0x7F, 0x4A, 0xAA, 0x7A, 0x16, 0xA9, 0x67, 0x40, 0xAA, 0x7, 0x92, 0x6, 0xA9, 0x0, 0x0, 0xF0, 0xFF];

const piersIcon = [0x0, 0x0, 0x0, 0x0, 0xC0, 0x21, 0x0, 0xE2, 0x9F, 0x4F, 0x4A, 0x3, 0xF9, 0x6F, 0x4C, 0x7E, 0xC8, 0xC2, 0xF6, 0x8C, 0x88, 0x94, 0x41, 
    0xBA, 0xB7, 0x5B, 0xAA, 0xBB, 0x87, 0x54, 0x57, 0xFD, 0xFD, 0x23, 0xD5, 0x53, 0xB5, 0x52, 0xFF, 0xD6, 0xCF, 0xBF, 0x91, 0x54, 0x5F, 0x1D, 0x75, 0xE7, 
    0x22, 0x51, 0x3D, 0x48, 0xFD, 0xFC, 0xFC, 0xF7, 0x23, 0xD5, 0xB3, 0xC7, 0x57, 0xFD, 0x5C, 0x97, 0x54, 0x75, 0xDF, 0x69, 0x35, 0xBB, 0x25, 0x55, 0xDD, 
    0xB3, 0x24, 0xBF, 0xB, 0x52, 0x1D, 0xA0, 0x40, 0x0, 0x0, 0xE0, 0xFF];

module.exports = { isaacIcon, garetIcon, ivanIcon, miaIcon, felixIcon, jennaIcon, shebaIcon, piersIcon };