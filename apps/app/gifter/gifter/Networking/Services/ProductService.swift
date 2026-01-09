//
//  ProductService.swift
//  gifter
//
//  Product Service
//

import Foundation

final class ProductService {
    static let shared = ProductService()

    private let client = APIClient.shared

    private init() {}

    // MARK: - Products

    func search(
        query: String? = nil,
        category: String? = nil,
        limit: Int = 20,
        offset: Int = 0
    ) async throws -> (products: [Product], hasMore: Bool, total: Int) {
        let response: ProductListResponse = try await client.request(
            ProductEndpoint.search(query: query, category: category, limit: limit, offset: offset)
        )

        return (
            products: response.products.map { $0.toDomain() },
            hasMore: response.hasMore,
            total: response.total
        )
    }

    func getProduct(id: String) async throws -> Product {
        let response: ProductDTO = try await client.request(ProductEndpoint.getProduct(id: id))
        return response.toDomain()
    }

    // MARK: - Recommendations

    func getRecommendations(limit: Int = 20) async throws -> [Product] {
        let response: RecommendationListResponse = try await client.request(
            ProductEndpoint.getRecommendations(limit: limit)
        )

        return response.recommendations.map { $0.toDomain() }
    }

    func getRecommendationsForOccasion(occasionId: String, limit: Int = 20) async throws -> [Product] {
        let response: RecommendationListResponse = try await client.request(
            ProductEndpoint.getRecommendationsForOccasion(occasionId: occasionId, limit: limit)
        )

        return response.recommendations.map { $0.toDomain() }
    }
}
