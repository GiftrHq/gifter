//
//  ProductDTOs.swift
//  gifter
//
//  Product Request/Response DTOs
//

import Foundation

// MARK: - Responses

struct ProductListResponse: Decodable {
    let products: [ProductDTO]
    let total: Int
    let limit: Int
    let offset: Int
    let hasMore: Bool
}

struct ProductDTO: Decodable {
    let id: String
    let title: String
    let slug: String?
    let description: String?
    let brand: BrandDTO?
    let price: Double
    let currency: String
    let compareAtPrice: Double?
    let images: [String]
    let category: String?
    let tags: [String]?
    let status: String
    let storeURL: String?
    let enrichment: ProductEnrichmentDTO?

    func toDomain() -> Product {
        Product(
            id: id,
            brand: brand?.name ?? "Unknown",
            title: title,
            description: description ?? "",
            price: price,
            currency: currency,
            images: images,
            tags: tags ?? [],
            storeURL: storeURL ?? "",
            aiExplanation: enrichment?.whyItWorks
        )
    }
}

struct BrandDTO: Decodable {
    let id: String
    let name: String
    let slug: String?
    let logo: String?
}

struct ProductEnrichmentDTO: Decodable {
    let giftingScore: Int?
    let giftPersonas: [String]?
    let occasionFit: [String: Int]?
    let whyItWorks: String?
    let pricePerception: String?
    let targetDemographics: [String]?
}

// MARK: - Recommendation Response

struct RecommendationListResponse: Decodable {
    let recommendations: [RecommendationDTO]
    let requestId: String?
}

struct RecommendationDTO: Decodable {
    let product: ProductDTO
    let score: Double
    let explanation: String?
    let matchReasons: [String]?

    func toDomain() -> Product {
        var product = self.product.toDomain()
        product.aiExplanation = explanation
        return product
    }
}
