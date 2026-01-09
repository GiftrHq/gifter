//
//  WishlistDTOs.swift
//  gifter
//
//  Wishlist Request/Response DTOs
//

import Foundation

// MARK: - Requests

struct CreateWishlistRequest: Encodable {
    let name: String
    let description: String?
    let visibility: String? // PRIVATE, FRIENDS, PUBLIC
}

struct AddWishlistItemRequest: Encodable {
    let productId: String
}

// MARK: - Responses

struct WishlistListResponse: Decodable {
    let wishlists: [WishlistDTO]
}

struct WishlistDTO: Decodable {
    let id: String
    let userId: String
    let name: String
    let description: String?
    let visibility: String
    let itemCount: Int
    let items: [WishlistItemDTO]?
}

struct WishlistItemDTO: Decodable {
    let id: String
    let wishlistId: String
    let productId: String?
    let externalURL: String?
    let externalTitle: String?
    let externalImage: String?
    let notes: String?
    let priority: Int
    let addedAt: String
    let product: ProductDTO?

    func toDomain() -> Product? {
        product?.toDomain()
    }
}
