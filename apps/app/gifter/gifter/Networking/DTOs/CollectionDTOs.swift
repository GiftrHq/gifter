//
//  CollectionDTOs.swift
//  gifter
//
//  Collection Request/Response DTOs
//

import Foundation

// MARK: - Responses

struct CollectionListResponse: Decodable {
    let collections: [CollectionDTO]
    let total: Int
}

struct CollectionDTO: Decodable {
    let id: String
    let title: String
    let slug: String?
    let description: String?
    let narrative: String?
    let imageURL: String?
    let theme: String?
    let occasion: String?
    let productCount: Int
    let isPersonalized: Bool?

    func toDomain(products: [Product] = []) -> GiftCollection {
        GiftCollection(
            id: id,
            title: title,
            subtitle: theme ?? occasion ?? "",
            description: description ?? "",
            heroImage: imageURL ?? "",
            products: products,
            brands: []
        )
    }
}

struct CollectionDetailResponse: Decodable {
    let collection: CollectionDTO
    let products: [ProductDTO]?
}

struct CollectionProductsResponse: Decodable {
    let products: [ProductDTO]
    let total: Int
    let limit: Int
    let offset: Int
    let hasMore: Bool
}
