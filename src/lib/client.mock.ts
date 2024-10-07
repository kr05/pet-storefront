// This file contains mock functions for all storefront services.
// You can use this as a template to connect your own ecommerce provider.

import type { Options, RequestResult } from '@hey-api/client-fetch';
import type {
    Collection,
    CreateCustomerData,
    CreateCustomerError,
    CreateCustomerResponse,
    CreateOrderData,
    CreateOrderError,
    CreateOrderResponse,
    GetCollectionByIdData,
    GetCollectionByIdError,
    GetCollectionByIdResponse,
    GetCollectionsData,
    GetCollectionsError,
    GetCollectionsResponse,
    GetOrderByIdData,
    GetOrderByIdError,
    GetOrderByIdResponse,
    GetProductByIdData,
    GetProductByIdError,
    GetProductByIdResponse,
    GetProductsData,
    GetProductsError,
    GetProductsResponse,
    Order,
    Product,
} from './client.types.ts';

export * from './client.types.ts';

export const getProducts = <ThrowOnError extends boolean = false>(
    options?: Options<GetProductsData, ThrowOnError>,
): RequestResult<GetProductsResponse, GetProductsError, ThrowOnError> => {
    let items = Object.values(products);
    if (options?.query?.collectionId) {
        const collectionId = options.query.collectionId;
        items = items.filter((product) => product.collectionIds?.includes(collectionId));
    }
    if (options?.query?.ids) {
        const ids = Array.isArray(options.query.ids) ? options.query.ids : [options.query.ids];
        items = items.filter((product) => ids.includes(product.id));
    }
    if (options?.query?.sort && options?.query?.order) {
        const { sort, order } = options.query;
        if (sort === 'price') {
            items = items.sort((a, b) => {
                return order === 'asc' ? a.price - b.price : b.price - a.price;
            });
        } else if (sort === 'name') {
            items = items.sort((a, b) => {
                return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            });
        }
    }
    return asResult({ items, next: null });
};

export const getProductById = <ThrowOnError extends boolean = false>(
    options: Options<GetProductByIdData, ThrowOnError>,
): RequestResult<GetProductByIdResponse, GetProductByIdError, ThrowOnError> => {
    const product = products[options.path.id];
    if (!product) {
        const error = asError<GetProductByIdError>({ error: 'not-found' });
        if (options.throwOnError) throw error;
        return error as RequestResult<GetProductByIdResponse, GetProductByIdError, ThrowOnError>;
    }
    return asResult(product);
};

export const getCollections = <ThrowOnError extends boolean = false>(
    _options?: Options<GetCollectionsData, ThrowOnError>,
): RequestResult<GetCollectionsResponse, GetCollectionsError, ThrowOnError> => {
    return asResult({ items: Object.values(collections), next: null });
};

export const getCollectionById = <ThrowOnError extends boolean = false>(
    options: Options<GetCollectionByIdData, ThrowOnError>,
): RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError> => {
    const collection = collections[options.path.id];
    if (!collection) {
        const error = asError<GetCollectionByIdError>({ error: 'not-found' });
        if (options.throwOnError) throw error;
        return error as RequestResult<GetCollectionByIdResponse, GetCollectionByIdError, ThrowOnError>;
    }
    return asResult({ ...collection, products: [] });
};

export const createCustomer = <ThrowOnError extends boolean = false>(
    options?: Options<CreateCustomerData, ThrowOnError>,
): RequestResult<CreateCustomerResponse, CreateCustomerError, ThrowOnError> => {
    if (!options?.body) throw new Error('No body provided');
    return asResult({
        ...options.body,
        id: options.body.id ?? 'customer-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
    });
};

const orders: Record<string, Order> = {};

export const createOrder = <ThrowOnError extends boolean = false>(
    options?: Options<CreateOrderData, ThrowOnError>,
): RequestResult<CreateOrderResponse, CreateOrderError, ThrowOnError> => {
    if (!options?.body) throw new Error('No body provided');
    const order: Order = {
        ...options.body,
        id: 'dk3fd0sak3d',
        number: 1001,
        lineItems: options.body.lineItems.map((lineItem) => ({
            ...lineItem,
            id: `line-item-${lineItem.productId}`,
        })),
        billingAddress: getAddress(options.body.billingAddress),
        shippingAddress: getAddress(options.body.shippingAddress),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
    };
    orders[order.id] = order;
    return asResult(order);
};

export const getOrderById = <ThrowOnError extends boolean = false>(
    options: Options<GetOrderByIdData, ThrowOnError>,
): RequestResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError> => {
    const order = orders[options.path.id];
    if (!order) {
        const error = asError<GetOrderByIdError>({ error: 'not-found' });
        if (options.throwOnError) throw error;
        return error as RequestResult<GetOrderByIdResponse, GetOrderByIdError, ThrowOnError>;
    }
    return asResult(order);
};

const collectionDefaults = {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
};

const collections: Record<string, Collection> = {
    higiene: {
        id: 'higiene',
        name: 'Higiene',
        description: 'Productos para la higiene y cuidado de tu mascota.',
        slug: 'higiene',
        imageUrl: '/assets/shirts.png',
        ...collectionDefaults,
    },
    apparel: {
        id: 'apparel',
        name: 'Apparel',
        description: 'Wear your love for Astro on your sleeve.',
        slug: 'apparel',
        imageUrl: '/assets/shirts.png',
        ...collectionDefaults,
    },
    stickers: {
        id: 'stickers',
        name: 'Stickers',
        description: 'Load up those laptop lids with Astro pride.',
        slug: 'stickers',
        imageUrl: '/assets/astro-sticker-pack.png',
        ...collectionDefaults,
    },
    bestSellers: {
        id: 'bestSellers',
        name: 'Best Sellers',
        description: "You'll love these.",
        slug: 'best-sellers',
        imageUrl: '/assets/astro-houston-sticker.png',
        ...collectionDefaults,
    },
};

const bravectoVariations = [
    {
        id: 'peso',
        name: 'Peso',
        options: [
            { id: 'xs', price: 225, name: 'xs', caption: '2kg - 4.5kg' },
            { id: 's', price: 235, name: 's', caption: '4.5kg - 10kg' },
            { id: 'm', price: 245, name: 'm', caption: '10kg - 20kg' },
            { id: 'l', price: 260, name: 'l', caption: '20kg - 40kg' },
        ],
    },
];

const shirtVariations = [
    {
        id: 'color',
        name: 'Color',
        options: [
            { id: 'grey', name: 'Grey', caption: 'Grey' },
            { id: 'black', name: 'Black', caption: 'Black' },
            { id: 'red', name: 'Red', caption: 'Red' },
            { id: 'blue', name: 'Blue', caption: 'Blue' },
        ],
    },
    {
        id: 'size',
        name: 'Size',
        options: [
            { id: 'xs', name: 'XS', caption: 'XS' },
            { id: 's', name: 'S', caption: 'S' },
            { id: 'm', name: 'M', caption: 'M' },
            { id: 'l', name: 'L', caption: 'L' },
            { id: 'xl', name: 'XL', caption: 'XL' },
            { id: 'xxl', name: 'XXL', caption: 'XXL' },
            { id: 'xxxl', name: 'XXXL', caption: 'XXXL' },
        ],
    },
];

const productDefaults = {
    description: '',
    images: [],
    discount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
};

const products: Record<string, Product> = {
    'bravecto-1-mes': {
        ...productDefaults,
        id: 'bravecto-1-mes',
        name: 'BRAVECTO® 1M',
        slug: 'bravecto-1-mes',
        tagline: 'Bravecto es un tratamiento eficaz contra pulgas y garrapatas para perros de todas las razas. Es un comprimido masticable que inicia su acción a partir de las dos horas de consumirlo, obteniendo su máxima eficacia a las 8 horas contra pulgas y 12 horas contra garrapatas. Brinda protección contra pulgas y garrapatas.',
        price: 22000,
        stock: 50,
        imageUrl: '/assets/bravecto-1-month_2-4.5.jpeg',
        variations: bravectoVariations,
        collectionIds: ['higiene'],
    },
    'bravecto-3-meses': {
        ...productDefaults,
        id: 'bravecto-3-meses',
        name: 'BRAVECTO® 3M',
        slug: 'bravecto-3-meses',
        tagline: 'Bravecto es un tratamiento eficaz contra pulgas y garrapatas para perros de todas las razas. Es un comprimido masticable que inicia su acción a partir de las dos horas de consumirlo, obteniendo su máxima eficacia a las 8 horas contra pulgas y 12 horas contra garrapatas. Brinda protección contra pulgas y garrapatas.',
        price: 22000,
        stock: 50,
        imageUrl: '/assets/bravecto_2-4.5.jpeg',
        variations: bravectoVariations,
        collectionIds: ['higiene'],
    },
    'astro-logo-curve-bill-snapback-cap': {
        id: 'astro-logo-curve-bill-snapback-cap',
        name: 'Astro Logo Curve Bill Snapback Cap',
        slug: 'astro-logo-curve-bill-snapback-cap',
        tagline: 'The best hat for any occasion, no cap.',
        stock: 50,
        price: 2500,
        imageUrl: '/assets/astro-cap.png',
        collectionIds: ['apparel'],
        ...productDefaults,
    },
    'astro-sticker-sheet': {
        id: 'astro-sticker-sheet',
        name: 'Astro Sticker Sheet',
        slug: 'astro-sticker-sheet',
        tagline: "You probably want this for the fail whale sticker, don't you?",
        stock: 50,
        price: 1000,
        imageUrl: '/assets/astro-universe-stickers.png',
        collectionIds: ['stickers'],
        ...productDefaults,
    },
    'sticker-pack': {
        id: 'sticker-pack',
        name: 'Sticker Pack',
        slug: 'sticker-pack',
        tagline: 'Jam packed with the most popular stickers.',
        stock: 50,
        price: 500,
        imageUrl: '/assets/astro-sticker-pack.png',
        collectionIds: ['stickers', 'bestSellers'],
        ...productDefaults,
    },
    'astro-icon-unisex-shirt': {
        id: 'astro-icon-unisex-shirt',
        name: 'Astro Icon Unisex Shirt',
        slug: 'astro-icon-unisex-shirt',
        tagline: 'A comfy Tee with the classic Astro logo.',
        stock: 50,
        price: 1775,
        imageUrl: '/assets/astro-unisex-tshirt.png',
        variations: shirtVariations,
        collectionIds: ['apparel'],
        ...productDefaults,
    },
    'astro-icon-gradient-sticker': {
        id: 'astro-icon-gradient-sticker',
        name: 'Astro Icon Gradient Sticker',
        slug: 'astro-icon-gradient-sticker',
        tagline: "There gradi-ain't a better sticker than the classic Astro logo.",
        stock: 50,
        price: 200,
        imageUrl: '/assets/astro-icon-sticker.png',
        collectionIds: ['stickers', 'bestSellers'],
        ...productDefaults,
    },
    'astro-logo-beanie': {
        id: 'astro-logo-beanie',
        name: 'Astro Logo Beanie',
        slug: 'astro-logo-beanie',
        tagline: "There's never Bean a better hat for the winter season.",
        stock: 50,
        price: 1800,
        imageUrl: '/assets/astro-beanie.png',
        collectionIds: ['apparel', 'bestSellers'],
        ...productDefaults,
    },
    'lighthouse-100-sticker': {
        id: 'lighthouse-100-sticker',
        name: 'Lighthouse 100 Sticker',
        slug: 'lighthouse-100-sticker',
        tagline: 'Bad performance? Not in my (light) house.',
        stock: 50,
        price: 500,
        imageUrl: '/assets/astro-lighthouse-sticker.png',
        collectionIds: ['stickers'],
        ...productDefaults,
    },
    'houston-sticker': {
        ...productDefaults,
        id: 'houston-sticker',
        name: 'Houston Sticker',
        slug: 'houston-sticker',
        tagline: 'You can fit a Hous-ton of these on any laptop lid.',
        stock: 50,
        price: 250,
        discount: 100,
        imageUrl: '/assets/astro-houston-sticker.png',
        collectionIds: ['stickers', 'bestSellers'],
    },
};

function asResult<T>(data: T) {
    return Promise.resolve({
        data,
        error: undefined,
        request: new Request('https://example.com'),
        response: new Response(),
    });
}

function asError<T>(error: T) {
    return Promise.resolve({
        data: undefined,
        error,
        request: new Request('https://example.com'),
        response: new Response(),
    });
}

function getAddress(address: Required<CreateOrderData>['body']['shippingAddress']) {
    return {
        line1: address?.line1 ?? '',
        line2: address?.line2 ?? '',
        city: address?.city ?? '',
        country: address?.country ?? '',
        province: address?.province ?? '',
        postal: address?.postal ?? '',
        phone: address?.phone ?? null,
        company: address?.company ?? null,
        firstName: address?.firstName ?? null,
        lastName: address?.lastName ?? null,
    };
}
