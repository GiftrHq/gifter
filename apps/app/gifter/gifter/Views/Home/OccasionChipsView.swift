//
//  OccasionChipsView.swift
//  gifter
//
//  Occasions Chips Component
//

import SwiftUI

struct OccasionChipsView: View {
    let occasions: [Occasion]

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(occasions) { occasion in
                    NavigationLink(destination: OccasionDetailView(occasion: occasion)) {
                        OccasionChip(occasion: occasion)
                    }
                }
            }
            .padding(.horizontal, 24)
        }
    }
}

struct OccasionChip: View {
    let occasion: Occasion

    var body: some View {
        HStack(spacing: 12) {
            // Avatar/Initials
            Circle()
                .fill(GifterColors.gifterSoftGray)
                .frame(width: 40, height: 40)
                .overlay(
                    Text(String(occasion.personName.prefix(1)))
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(GifterColors.gifterWhite)
                )

            VStack(alignment: .leading, spacing: 2) {
                Text("\(occasion.personName) · \(occasion.relationship)")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(GifterColors.gifterWhite)

                Text(occasion.countdownText)
                    .font(.system(size: 12))
                    .foregroundColor(GifterColors.gifterGray)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(GifterColors.gifterOffBlack)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(GifterColors.gifterSoftGray, lineWidth: 1)
        )
    }
}
