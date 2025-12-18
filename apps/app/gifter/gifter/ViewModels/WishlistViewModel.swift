//
//  WishlistViewModel.swift
//  gifter
//
//  Wishlist Management
//

import SwiftUI

class WishlistViewModel: ObservableObject {
    static let shared = WishlistViewModel()

    @Published var myWishlist: [Product] = []
    @Published var giftPlans: [String: [Product]] = [:] // profileID -> products

    func addToMyWishlist(_ product: Product) {
        if !myWishlist.contains(where: { $0.id == product.id }) {
            myWishlist.append(product)
        }
    }

    func removeFromMyWishlist(_ product: Product) {
        myWishlist.removeAll { $0.id == product.id }
    }

    func addToGiftPlan(profileID: String, product: Product) {
        if giftPlans[profileID] == nil {
            giftPlans[profileID] = []
        }
        if !giftPlans[profileID]!.contains(where: { $0.id == product.id }) {
            giftPlans[profileID]!.append(product)
        }
    }

    func removeFromGiftPlan(profileID: String, product: Product) {
        giftPlans[profileID]?.removeAll { $0.id == product.id }
    }

    func productsFor(profileID: String) -> [Product] {
        giftPlans[profileID] ?? []
    }
}
