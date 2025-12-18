//
//  CollectionCarouselView.swift
//  gifter
//
//  Collections Carousel Component
//

import SwiftUI

struct CollectionCarouselView: View {
    let collections: [GiftCollection]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 16) {
                ForEach(Array(collections.enumerated()), id: \.element.id) { index, collection in
                    NavigationLink(destination: CollectionDetailView(collection: collection)) {
                        CollectionCardView(collection: collection)
                    }
                }
            }
            .padding(.horizontal, 24)
        }
    }
}

struct CollectionCardView: View {
    let collection: GiftCollection

    var body: some View {
        ZStack(alignment: .bottom) {
            // Placeholder for image
            Rectangle()
                .fill(GifterColors.gifterOffBlack)
                .frame(width: 280, height: 360)

            // Gradient overlay
            LinearGradient(
                gradient: Gradient(colors: [
                    Color.clear,
                    Color.black.opacity(0.8)
                ]),
                startPoint: .center,
                endPoint: .bottom
            )

            // Text content
            VStack(alignment: .leading, spacing: 4) {
                Text(collection.title)
                    .font(.custom("PlayfairDisplay-Regular", size: 20))
                    .foregroundColor(GifterColors.gifterWhite)

                Text(collection.subtitle)
                    .gifterCaption()
            }
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(width: 280, height: 360)
        .cornerRadius(20)
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(GifterColors.gifterSoftGray, lineWidth: 1)
        )
    }
}
