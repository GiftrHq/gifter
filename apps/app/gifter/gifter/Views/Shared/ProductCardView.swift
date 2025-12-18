//
//  ProductCardView.swift
//  gifter
//
//  Reusable Product Card Component
//

import SwiftUI

struct ProductCardView: View {
    let product: Product
    var showAIContext: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Product image placeholder
            Rectangle()
                .fill(GifterColors.gifterOffBlack)
                .frame(width: 200, height: 200)
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
                    .tracking(1)

                Text(product.title)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(GifterColors.gifterWhite)
                    .lineLimit(2)

                Text(product.formattedPrice)
                    .font(.system(size: 14))
                    .foregroundColor(GifterColors.gifterWhite)

                if showAIContext, let explanation = product.aiExplanation {
                    Text(explanation)
                        .font(.system(size: 12))
                        .foregroundColor(GifterColors.gifterGray)
                        .lineLimit(2)
                        .padding(.top, 4)
                }
            }
        }
        .frame(width: 200)
    }
}
