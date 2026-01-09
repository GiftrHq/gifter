//
//  ThisOrThatQuestionView.swift
//  gifter
//
//  This or That Question Component (Binary Choice)
//

import SwiftUI

struct ThisOrThatQuestionView: View {
    let question: OnboardingQuestion
    let onSubmit: (Any) -> Void

    // Should have exactly 2 options
    private var optionA: OnboardingOption? {
        question.options.first
    }

    private var optionB: OnboardingOption? {
        question.options.dropFirst().first
    }

    var body: some View {
        VStack(spacing: 24) {
            if let optionA = optionA, let optionB = optionB {
                HStack(spacing: 16) {
                    ThisOrThatCard(option: optionA) {
                        onSubmit(optionA.id)
                    }

                    Text("or")
                        .gifterCaption()
                        .foregroundColor(GifterColors.gifterGray)

                    ThisOrThatCard(option: optionB) {
                        onSubmit(optionB.id)
                    }
                }
                .padding(.horizontal, 24)
            }
        }
    }
}

// MARK: - This or That Card

struct ThisOrThatCard: View {
    let option: OnboardingOption
    let action: () -> Void

    @State private var isPressed = false

    var body: some View {
        Button(action: {
            let impactMed = UIImpactFeedbackGenerator(style: .medium)
            impactMed.impactOccurred()
            action()
        }) {
            VStack(spacing: 12) {
                // Image placeholder or icon
                if let imageURL = option.imageURL {
                    AsyncImage(url: URL(string: imageURL)) { image in
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } placeholder: {
                        Rectangle()
                            .fill(GifterColors.gifterSoftGray)
                    }
                    .frame(width: 80, height: 80)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }

                Text(option.label)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(GifterColors.gifterWhite)
                    .multilineTextAlignment(.center)

                if let description = option.description {
                    Text(description)
                        .font(.system(size: 12))
                        .foregroundColor(GifterColors.gifterGray)
                        .multilineTextAlignment(.center)
                        .lineLimit(2)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 24)
            .padding(.horizontal, 16)
            .background(GifterColors.gifterOffBlack)
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(GifterColors.gifterSoftGray, lineWidth: 1)
            )
            .scaleEffect(isPressed ? 1.02 : 1.0)
        }
        .buttonStyle(PlainButtonStyle())
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    withAnimation(.easeOut(duration: 0.1)) {
                        isPressed = true
                    }
                }
                .onEnded { _ in
                    withAnimation(.easeOut(duration: 0.1)) {
                        isPressed = false
                    }
                }
        )
    }
}
