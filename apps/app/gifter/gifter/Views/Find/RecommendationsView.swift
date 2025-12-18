//
//  RecommendationsView.swift
//  gifter
//
//  AI Recommendations for a Person
//

import SwiftUI

struct RecommendationsView: View {
    let profile: GiftingProfile

    @State private var isLoading = true
    @State private var recommendations: [Product] = []

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            if isLoading {
                LoadingView(message: "Curating ideas for \(profile.name)...")
            } else {
                ScrollView {
                    VStack(spacing: 32) {
                        // Header
                        VStack(spacing: 12) {
                            Text("Let's find something for \(profile.name).")
                                .gifterDisplayL()
                                .multilineTextAlignment(.center)

                            Text("I'm using what you've told me about them to shortlist a few things.")
                                .gifterBody()
                                .foregroundColor(GifterColors.gifterGray)
                                .multilineTextAlignment(.center)
                        }
                        .padding(.horizontal, 32)
                        .padding(.top, 20)

                        // Profile tags
                        if !profile.threeWords.isEmpty {
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 8) {
                                    ForEach(profile.threeWords, id: \.self) { word in
                                        GifterPill(text: word, style: .outlined)
                                    }
                                }
                                .padding(.horizontal, 24)
                            }
                        }

                        // Products grid
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 20) {
                            ForEach(recommendations) { product in
                                NavigationLink(destination: ProductDetailView(product: product, context: .person(profile))) {
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
                Text(profile.name)
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
