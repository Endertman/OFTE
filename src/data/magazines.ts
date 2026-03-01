export interface Magazine {
    slug: string;
    title: string;
    description: string;
    coverImage: string;
    folder: string;
    pageCount: number;
    filePattern: string;
}

/**
 * Genera las URLs de las páginas de una revista.
 * El patrón usa {NUM} como placeholder para el número con padding de 5 dígitos.
 */
export function getPageUrls(magazine: Magazine): string[] {
    return Array.from({ length: magazine.pageCount }, (_, i) => {
        const num = String(i + 1).padStart(5, '0');
        return `${magazine.folder}/${magazine.filePattern.replace('{NUM}', num)}`;
    });
}

export const magazines: Magazine[] = [
    {
        slug: 'book1',
        title: 'Attention is All You Need - Vol. 1',
        description: 'Primera edición de la revista científica OFTE.',
        coverImage: '/books/book1/Attencion is all you need-page-00001.jpg',
        folder: '/books/book1',
        pageCount: 15,
        filePattern: 'Attencion is all you need-page-{NUM}.jpg',
    },
    {
        slug: 'book2',
        title: 'Attention is All You Need - Vol. 2',
        description: 'Segunda edición de la revista científica OFTE.',
        coverImage: '/books/book2/Attencion is all you need-page-00001.jpg',
        folder: '/books/book2',
        pageCount: 15,
        filePattern: 'Attencion is all you need-page-{NUM}.jpg',
    },
];
