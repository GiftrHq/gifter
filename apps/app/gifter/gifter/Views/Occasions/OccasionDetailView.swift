//
//  OccasionDetailView.swift
//  gifter
//
//  Occasion Detail View
//

import SwiftUI

struct OccasionDetailView: View {
    let occasion: Occasion

    @State private var isLoading = true
    @State private var recommendations: [Product] = []

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            if isLoading {
                LoadingView(message: "Finding the perfect gift for \(occasion.personName)...")
            } else {
                ScrollView {
                    VStack(spacing: 32) {
                        // Summary card
                        GifterCard {
                            VStack(alignment: .leading, spacing: 12) {
                                HStack {
                                    Circle()
                                        .fill(GifterColors.gifterSoftGray)
                                        .frame(width: 48, height: 48)
                                        .overlay(
                                            Text(String(occasion.personName.prefix(1)))
                                                .font(.system(size: 18, weight: .medium))
                                                .foregroundColor(GifterColors.gifterWhite)
                                        )

                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(occasion.personName)
                                            .font(.system(size: 18, weight: .medium))
                                            .foregroundColor(GifterColors.gifterWhite)

                                        Text(occasion.relationship)
                                            .font(.system(size: 14))
                                            .foregroundColor(GifterColors.gifterGray)
                                    }

                                    Spacer()
                                }

                                Divider()
                                    .background(GifterColors.gifterSoftGray)

                                HStack {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(occasion.occasionType)
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(GifterColors.gifterWhite)

                                        Text(occasion.formattedDate)
                                            .font(.system(size: 13))
                                            .foregroundColor(GifterColors.gifterGray)
                                    }

                                    Spacer()

                                    Text(occasion.countdownText)
                                        .font(.system(size: 16, weight: .medium))
                                        .foregroundColor(GifterColors.gifterWhite)
                                }
                            }
                            .padding(20)
                        }
                        .padding(.horizontal, 24)
                        .padding(.top, 20)

                        // Description
                        VStack(spacing: 12) {
                            Text("Let's find something for \(occasion.personName).")
                                .gifterDisplayL()
                                .multilineTextAlignment(.center)

                            Text("I'm using what you've told me about them — and what they've wished for — to shortlist a few things.")
                                .gifterBody()
                                .foregroundColor(GifterColors.gifterGray)
                                .multilineTextAlignment(.center)
                        }
                        .padding(.horizontal, 32)

                        // Products grid
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 20) {
                            ForEach(recommendations) { product in
                                NavigationLink(destination: ProductDetailView(
                                    product: product,
                                    context: .person(GiftingProfile(
                                        id: "occasion_\(occasion.id)",
                                        name: occasion.personName,
                                        relationship: occasion.relationship,
                                        threeWords: [],
                                        tasteProfile: nil,
                                        savedProducts: [],
                                        lastGifted: nil,
                                        createdAt: Date()
                                    ))
                                )) {
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
                }
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text(occasion.personName)
                    .gifterBody()
            }
        }
        .onAppear {
            loadRecommendations()
        }
    }

    private func loadRecommendations() {
        // Simulate loading
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            withAnimation {
                recommendations = MockData.products
                isLoading = false
            }
        }
    }
}
