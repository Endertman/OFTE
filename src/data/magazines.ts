export interface Magazine {
    slug: string;
    title: string;
    description: string;
    coverImage: string;
    folder: string;
    pageCount: number;
    filePattern: string;
    relatedArticles?: string[];
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
        title: 'Futura Physica - Vol 1',
        description: 'Primera edición de la revista científica OFTE.',
        coverImage: '/books/book1/FUTURA-PHYSICA_Vol.1_pages-to-jpg-0001.jpg',
        folder: '/books/book1',
        pageCount: 24,
        filePattern: 'FUTURA-PHYSICA_Vol.1_pages-to-jpg-{NUM}.jpg',
        relatedArticles: ['luz_cuantica_y_una_mirada_humana'],
    },

];
