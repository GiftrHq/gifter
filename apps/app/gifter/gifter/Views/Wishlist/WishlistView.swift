//
//  WishlistView.swift
//  gifter
//
//  Wishlist View
//

import SwiftUI

enum WishlistSegment: String, CaseIterable {
    case forMe = "For me"
    case forOthers = "For others"
}

struct WishlistView: View {
    @EnvironmentObject var wishlistViewModel: WishlistViewModel
    @State private var selectedSegment: WishlistSegment = .forMe

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            VStack(spacing: 0) {
                // Segmented control
                Picker("", selection: $selectedSegment) {
                    ForEach(WishlistSegment.allCases, id: \.self) { segment in
                        Text(segment.rawValue).tag(segment)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, 24)
                .padding(.top, 20)
                .padding(.bottom, 24)

                // Content based on segment
                if selectedSegment == .forMe {
                    forMeContent
                } else {
                    forOthersContent
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
    }

    private var forMeContent: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text("Your wishlists")
                        .gifterDisplayL()

                    Text("This is your quiet archive. I'll surface these when people are shopping for you.")
                        .gifterBody()
                        .foregroundColor(GifterColors.gifterGray)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 24)

                // Grid of saved items
                if wishlistViewModel.myWishlist.isEmpty {
                    VStack(spacing: 16) {
                        Text("Nothing saved yet.")
                            .gifterBody()
                            .foregroundColor(GifterColors.gifterGray)
                            .padding(.top, 40)

                        Text("Start exploring and save things you love.")
                            .gifterCaption()
                            .multilineTextAlignment(.center)
                    }
                    .padding(.horizontal, 32)
                } else {
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 20) {
                        ForEach(wishlistViewModel.myWishlist) { product in
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
                }

                Spacer(minLength: 100)
            }
        }
    }

    private var forOthersContent: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text("Gift plans")
                        .gifterDisplayL()

                    Text("Ideas you've saved for the people in your life.")
                        .gifterBody()
                        .foregroundColor(GifterColors.gifterGray)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 24)

                // List of gift plans
                if wishlistViewModel.giftPlans.isEmpty {
                    VStack(spacing: 16) {
                        Text("No gift plans yet.")
                            .gifterBody()
                            .foregroundColor(GifterColors.gifterGray)
                            .padding(.top, 40)

                        Text("Start finding gifts for the people you care about.")
                            .gifterCaption()
                            .multilineTextAlignment(.center)
                    }
                    .padding(.horizontal, 32)
                } else {
                    let profileIDs = Array(wishlistViewModel.giftPlans.keys)

                    VStack(spacing: 0) {
                        ForEach(profileIDs, id: \.self) { profileID in
                            let products = wishlistViewModel.productsFor(profileID: profileID)

                            GiftPlanRow(
                                profileID: profileID,
                                productCount: products.count
                            )

                            if profileID != profileIDs.last {
                                Divider()
                                    .background(GifterColors.gifterSoftGray)
                                    .padding(.leading, 80)
                            }
                        }
                    }
                }

                Spacer(minLength: 100)
            }
        }
    }
}

struct GiftPlanRow: View {
    let profileID: String
    let productCount: Int

    var body: some View {
        HStack(spacing: 16) {
            Circle()
                .fill(GifterColors.gifterSoftGray)
                .frame(width: 48, height: 48)
                .overlay(
                    Text("?")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundColor(GifterColors.gifterWhite)
                )

            VStack(alignment: .leading, spacing: 4) {
                Text("Gift Plan")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(GifterColors.gifterWhite)

                Text("\(productCount) \(productCount == 1 ? "idea" : "ideas") saved")
                    .font(.system(size: 14))
                    .foregroundColor(GifterColors.gifterGray)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 14))
                .foregroundColor(GifterColors.gifterGray)
        }
        .padding(.horizontal, 24)
        .padding(.vertical, 12)
        .contentShape(Rectangle())
    }
}
