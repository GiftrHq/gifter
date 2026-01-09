//
//  WishlistService.swift
//  gifter
//
//  Wishlist Service
//

import Foundation

final class WishlistService {
    static let shared = WishlistService()

    private let client = APIClient.shared

    private init() {}

    // MARK: - Wishlists

    func getWishlists() async throws -> [WishlistDTO] {
        let response: WishlistListResponse = try await client.request(WishlistEndpoint.getWishlists)
        return response.wishlists
    }

    func createWishlist(name: String, description: String? = nil, visibility: WishlistVisibility = .private) async throws -> WishlistDTO {
        let request = CreateWishlistRequest(
            name: name,
            description: description,
            visibility: visibility.rawValue
        )

        return try await client.request(WishlistEndpoint.createWishlist(request))
    }

    func addItem(wishlistId: String, productId: String) async throws {
        try await client.request(WishlistEndpoint.addItem(wishlistId: wishlistId, productId: productId))
    }

    func removeItem(wishlistId: String, itemId: String) async throws {
        try await client.request(WishlistEndpoint.removeItem(wishlistId: wishlistId, itemId: itemId))
    }
}

// MARK: - Wishlist Visibility
enum WishlistVisibility: String {
    case `private` = "PRIVATE"
    case friends = "FRIENDS"
    case `public` = "PUBLIC"
}
