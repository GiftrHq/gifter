//
//  ShortTextQuestionView.swift
//  gifter
//
//  Short Text Input Question Component
//

import SwiftUI

struct ShortTextQuestionView: View {
    let question: OnboardingQuestion
    let onSubmit: (Any) -> Void

    @State private var text = ""
    @FocusState private var isFocused: Bool

    var body: some View {
        VStack(spacing: 24) {
            // Text input field
            VStack(alignment: .leading, spacing: 8) {
                TextField("Type your answer...", text: $text)
                    .font(GifterTypography.body())
                    .foregroundColor(GifterColors.gifterWhite)
                    .padding()
                    .background(GifterColors.gifterOffBlack)
                    .cornerRadius(12)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(
                                isFocused ? GifterColors.gifterWhite : GifterColors.gifterSoftGray,
                                lineWidth: 1
                            )
                    )
                    .focused($isFocused)

                // Character count
                Text("\(text.count) / 200")
                    .gifterCaption()
                    .foregroundColor(GifterColors.gifterGray)
                    .frame(maxWidth: .infinity, alignment: .trailing)
            }
            .padding(.horizontal, 24)

            // Continue button
            GifterButton(title: "Continue", style: .primary) {
                onSubmit(text)
            }
            .disabled(text.trimmingCharacters(in: .whitespaces).isEmpty)
            .opacity(text.trimmingCharacters(in: .whitespaces).isEmpty ? 0.5 : 1.0)
            .padding(.horizontal, 24)
        }
        .onAppear {
            // Focus the text field after a short delay
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                isFocused = true
            }
        }
    }
}
