//
//  CollectionDetailView.swift
//  gifter
//
//  Collection Detail View
//

import SwiftUI

struct CollectionDetailView: View {
    let collection: GiftCollection

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 0) {
                    // Hero image with parallax
                    GeometryReader { geometry in
                        let offset = geometry.frame(in: .global).minY
                        let height: CGFloat = 400

                        ZStack(alignment: .bottom) {
                            Rectangle()
                                .fill(GifterColors.gifterOffBlack)
                                .frame(
                                    width: geometry.size.width,
                                    height: height + (offset > 0 ? offset : 0)
                                )
                                .offset(y: offset > 0 ? -offset : 0)

                            // Gradient overlay
                            LinearGradient(
                                gradient: Gradient(colors: [
                                    Color.clear,
                                    GifterColors.gifterBlack.opacity(0.9)
                                ]),
                                startPoint: .center,
                                endPoint: .bottom
                            )

                            // Title overlay
                            VStack(alignment: .leading, spacing: 8) {
                                Text(collection.title)
                                    .font(.custom("PlayfairDisplay-Regular", size: 32))
                                    .foregroundColor(GifterColors.gifterWhite)

                                Text(collection.subtitle)
                                    .gifterBody()
                                    .foregroundColor(GifterColors.gifterGray)
                            }
                            .padding(24)
                            .frame(maxWidth: .infinity, alignment: .leading)
                        }
                    }
                    .frame(height: 400)

                    // Content
                    VStack(spacing: 32) {
                        // Description
                        VStack(alignment: .leading, spacing: 12) {
                            Text(collection.description)
                                .gifterBody()
                                .foregroundColor(GifterColors.gifterGray)

                            if !collection.brands.isEmpty {
                                Text("Featuring brands: \(collection.brands.joined(separator: ", "))")
                                    .gifterCaption()
                            }
                        }
                        .padding(.horizontal, 24)

                        Text("You can save things for later or jump straight to the brands to buy.")
                            .gifterCaption()
                            .padding(.horizontal, 24)

                        // Products grid
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 20) {
                            ForEach(collection.products) { product in
                                NavigationLink(destination: ProductDetailView(product: product, context: .user)) {
                                    VStack(alignment: .leading, spacing: 12) {
                                        Rectangle()
                                            .fill(GifterColors.gifterOffBlack)
                                            .aspectRatio(1, contentMode: .fit)
                                            .cornerRadius(12)
                                            .overlay(
                                                RoundedRectangle(cornerRadius: 12)
                                                    .stroke(GifterColors.gifterSoftGray, lineWidth: 1)
                                            )

                                        VStack(alignment: .leading, spacing: 4) {
                                            Text(product.brand)
                                                .font(.system(size: 11, weight: .medium))
                                                .foregroundColor(GifterColors.gifterGray)
                                                .textCase(.uppercase)

                                            Text(product.title)
                                                .font(.system(size: 14, weight: .medium))
                                                .foregroundColor(GifterColors.gifterWhite)
                                                .lineLimit(2)

                                            Text(product.formattedPrice)
                                                .font(.system(size: 13))
                                                .foregroundColor(GifterColors.gifterWhite)
                                        }
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, 24)

                        Spacer(minLength: 100)
                    }
                    .padding(.top, 32)
                }
            }
            .ignoresSafeArea(edges: .top)
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Image("logo")
                    .resizable()
                    .renderingMode(.template)
                    .foregroundColor(GifterColors.gifterWhite)
                    .frame(width: 24, height: 24)
            }
        }
    }
}
