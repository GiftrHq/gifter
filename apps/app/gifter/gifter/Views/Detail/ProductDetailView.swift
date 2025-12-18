//
//  ProductDetailView.swift
//  gifter
//
//  Product Detail View
//

import SwiftUI

struct ProductDetailView: View {
    let product: Product
    let context: ProfileContext

    @EnvironmentObject var wishlistViewModel: WishlistViewModel
    @State private var showSavedConfirmation = false

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 32) {
                    // Image carousel
                    TabView {
                        ForEach(product.images, id: \.self) { imageName in
                            Rectangle()
                                .fill(GifterColors.gifterOffBlack)
                                .aspectRatio(1, contentMode: .fit)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 0)
                                        .stroke(GifterColors.gifterSoftGray, lineWidth: 1)
                                )
                        }
                    }
                    .tabViewStyle(.page)
                    .frame(height: UIScreen.main.bounds.width)
                    .indexViewStyle(.page(backgroundDisplayMode: .always))

                    // Product info card
                    GifterCard {
                        VStack(alignment: .leading, spacing: 16) {
                            VStack(alignment: .leading, spacing: 8) {
                                Text(product.brand)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(GifterColors.gifterGray)
                                    .textCase(.uppercase)
                                    .tracking(1.5)

                                Text(product.title)
                                    .font(.custom("PlayfairDisplay-Regular", size: 24))
                                    .foregroundColor(GifterColors.gifterWhite)

                                Text(product.formattedPrice)
                                    .font(.system(size: 18, weight: .medium))
                                    .foregroundColor(GifterColors.gifterWhite)
                            }

                            Text(product.description)
                                .gifterBody()
                                .foregroundColor(GifterColors.gifterGray)

                            // Tags
                            if !product.tags.isEmpty {
                                ScrollView(.horizontal, showsIndicators: false) {
                                    HStack(spacing: 8) {
                                        ForEach(product.tags, id: \.self) { tag in
                                            GifterPill(text: tag, style: .outlined)
                                        }
                                    }
                                    .padding(.horizontal, 4)
                                }
                                .padding(.horizontal, -4)
                            }

                            // AI Explanation
                            if let explanation = product.aiExplanation {
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack(spacing: 8) {
                                        GifterLogo(size: 16)

                                        Text("Why I picked this")
                                            .font(.system(size: 13, weight: .medium))
                                            .foregroundColor(GifterColors.gifterGray)
                                            .textCase(.uppercase)
                                    }

                                    Text(explanation)
                                        .gifterBody()
                                        .foregroundColor(GifterColors.gifterGray)
                                        .italic()
                                }
                                .padding(.top, 8)
                            }
                        }
                        .padding(20)
                    }
                    .padding(.horizontal, 24)

                    // Actions
                    VStack(spacing: 12) {
                        GifterButton(
                            title: saveButtonTitle,
                            style: .primary
                        ) {
                            handleSave()
                        }

                        GifterButton(
                            title: "View & buy from store",
                            style: .secondary
                        ) {
                            // Open store URL
                        }

                        Text("I'll take you to the brand's store to complete the purchase.")
                            .gifterCaption()
                            .multilineTextAlignment(.center)
                    }
                    .padding(.horizontal, 24)

                    Spacer(minLength: 100)
                }
            }
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
        .overlay(
            savedConfirmationOverlay
        )
    }

    private var saveButtonTitle: String {
        switch context {
        case .user:
            return "Save to my wishlist"
        case .person(let profile):
            return "Save for \(profile.name)"
        }
    }

    @ViewBuilder
    private var savedConfirmationOverlay: some View {
        if showSavedConfirmation {
            VStack {
                Spacer()

                HStack(spacing: 12) {
                    Image(systemName: "heart.fill")
                        .foregroundColor(GifterColors.gifterWhite)

                    Text("Saved. I'll remember this when it's gifting time.")
                        .gifterBody()
                }
                .padding(20)
                .background(GifterColors.gifterOffBlack)
                .cornerRadius(16)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(GifterColors.gifterSoftGray, lineWidth: 1)
                )
                .padding(.horizontal, 24)
                .padding(.bottom, 40)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
    }

    private func handleSave() {
        let impactMed = UIImpactFeedbackGenerator(style: .medium)
        impactMed.impactOccurred()

        switch context {
        case .user:
            wishlistViewModel.addToMyWishlist(product)
        case .person(let profile):
            wishlistViewModel.addToGiftPlan(profileID: profile.id, product: product)
        }

        withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
            showSavedConfirmation = true
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            withAnimation {
                showSavedConfirmation = false
            }
        }
    }
}
