//
//  Collection.swift
//  gifter
//
//  Core Models
//

import Foundation

struct GiftCollection: Identifiable, Codable, Hashable {
    let id: String
    let title: String
    let subtitle: String
    let description: String
    let heroImage: String
    let products: [Product]
    let brands: [String]
}
