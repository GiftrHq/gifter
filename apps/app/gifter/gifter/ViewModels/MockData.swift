//
//  MockData.swift
//  gifter
//
//  Mock data for development
//

import Foundation

struct MockData {
    static let products: [Product] = [
        Product(
            id: "1",
            brand: "KINTO",
            title: "Slow Coffee Carafe Set",
            description: "A minimalist pour-over coffee set for slow, mindful mornings.",
            price: 48.00,
            currency: "GBP",
            images: ["coffee_carafe"],
            tags: ["For the ritualist", "Under £50"],
            storeURL: "https://example.com",
            aiExplanation: "You said they love slow, considered mornings and you've saved a few ceramics before. This keeps that same energy without repeating what they already have."
        ),
        Product(
            id: "2",
            brand: "LABOUR AND WAIT",
            title: "Japanese Linen Tea Towels",
            description: "Handwoven linen tea towels that get softer with every wash.",
            price: 32.00,
            currency: "GBP",
            images: ["tea_towels"],
            tags: ["Homewares", "Under £50"],
            storeURL: "https://example.com",
            aiExplanation: "Because you liked 'Slow Coffee Carafe Set' and matches your minimal & clean style."
        ),
        Product(
            id: "3",
            brand: "AESOP",
            title: "Resurrection Hand Balm",
            description: "A rich botanical hand cream in Aesop's signature packaging.",
            price: 27.00,
            currency: "GBP",
            images: ["hand_balm"],
            tags: ["Self-care", "Under £50"],
            storeURL: "https://example.com",
            aiExplanation: "A small but considered gift that feels luxurious without being flashy."
        ),
        Product(
            id: "4",
            brand: "PENGUIN CLASSICS",
            title: "The Complete Essays - Michel de Montaigne",
            description: "Beautifully bound essays for the philosophical reader.",
            price: 35.00,
            currency: "GBP",
            images: ["essays_book"],
            tags: ["Books", "Under £50"],
            storeURL: "https://example.com",
            aiExplanation: "Matches your 'quiet night in with a book' preference."
        )
    ]

    static let collections: [GiftCollection] = [
        GiftCollection(
            id: "1",
            title: "For the Slow Morning Ritualist",
            subtitle: "Coffee, ceramics, and quiet.",
            description: "Pieces for the friend who treats mornings like a small ceremony.",
            heroImage: "collection_morning",
            products: Array(products.prefix(2)),
            brands: ["KINTO", "LABOUR AND WAIT"]
        ),
        GiftCollection(
            id: "2",
            title: "Small but Unforgettable",
            subtitle: "Gifts under £50 that still feel big.",
            description: "Thoughtful pieces that don't break the bank but feel special.",
            heroImage: "collection_small",
            products: products,
            brands: ["AESOP", "KINTO", "PENGUIN CLASSICS"]
        )
    ]

    static let occasions: [Occasion] = [
        Occasion(
            id: "1",
            personName: "Mia",
            relationship: "Sister",
            occasionType: "Birthday",
            date: Calendar.current.date(byAdding: .day, value: 6, to: Date())!,
            savedProducts: [],
            status: .planning
        ),
        Occasion(
            id: "2",
            personName: "James",
            relationship: "Partner",
            occasionType: "Anniversary",
            date: Calendar.current.date(byAdding: .day, value: 24, to: Date())!,
            savedProducts: [],
            status: .planning
        )
    ]

    static let giftingProfiles: [GiftingProfile] = [
        GiftingProfile(
            id: "1",
            name: "Sarah",
            relationship: "Friend",
            threeWords: ["Creative", "Minimalist", "Coffee-lover"],
            tasteProfile: nil,
            savedProducts: [],
            lastGifted: Calendar.current.date(byAdding: .month, value: -3, to: Date()),
            createdAt: Date()
        ),
        GiftingProfile(
            id: "2",
            name: "Dad",
            relationship: "Father",
            threeWords: ["Practical", "Outdoorsy", "Tech-savvy"],
            tasteProfile: nil,
            savedProducts: [],
            lastGifted: nil,
            createdAt: Date()
        )
    ]
}
