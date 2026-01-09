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
    @State private var isVisible = false

    var body: some View {
        ZStack(alignment: .bottom) {
            // Hero Image
            if let imageURL = URL(string: collection.heroImage) {
                AsyncImage(url: imageURL) { phase in
                    switch phase {
                    case .empty:
                        // Loading state
                        Rectangle()
                            .fill(GifterColors.gifterOffBlack)
                            .overlay(
                                ProgressView()
                                    .tint(GifterColors.gifterGray)
                            )
                    case .success(let image):
                        // Loaded image
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 280, height: 360)
                            .clipped()
                            .transition(.opacity.combined(with: .scale(scale: 1.05)))
                    case .failure:
                        // Error state - show placeholder
                        Rectangle()
                            .fill(GifterColors.gifterOffBlack)
                    @unknown default:
                        Rectangle()
                            .fill(GifterColors.gifterOffBlack)
                    }
                }
                .frame(width: 280, height: 360)
            } else {
                // No URL - show placeholder
                Rectangle()
                    .fill(GifterColors.gifterOffBlack)
                    .frame(width: 280, height: 360)
            }

            // Gradient overlay
            LinearGradient(
                gradient: Gradient(colors: [
                    Color.clear,
                    Color.black.opacity(0.7),
                    Color.black.opacity(0.9)
                ]),
                startPoint: .center,
                endPoint: .bottom
            )

            // Text content
            VStack(alignment: .leading, spacing: 6) {
                Text(collection.title)
                    .font(.custom("PlayfairDisplay-Regular", size: 22))
                    .foregroundColor(GifterColors.gifterWhite)
                    .lineLimit(2)

                Text(collection.subtitle)
                    .gifterCaption()
                    .lineLimit(2)

                // Product count badge
                if !collection.products.isEmpty {
                    Text("\(collection.products.count) items")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(GifterColors.gifterGray)
                        .padding(.top, 4)
                }
            }
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(width: 280, height: 360)
        .cornerRadius(20)
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(GifterColors.gifterSoftGray.opacity(0.3), lineWidth: 1)
        )
        .shadow(
            color: Color.black.opacity(0.3),
            radius: 20,
            x: 0,
            y: 10
        )
        .scaleEffect(isVisible ? 1 : 0.95)
        .opacity(isVisible ? 1 : 0)
        .onAppear {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                isVisible = true
            }
        }
    }
}
