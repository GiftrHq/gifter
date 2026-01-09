//
//  ScaleQuestionView.swift
//  gifter
//
//  Scale/Slider Question Component
//

import SwiftUI

struct ScaleQuestionView: View {
    let question: OnboardingQuestion
    let onSubmit: (Any) -> Void

    @State private var selectedValue: Double

    private var minValue: Double {
        Double(question.scaleMin ?? 1)
    }

    private var maxValue: Double {
        Double(question.scaleMax ?? 5)
    }

    init(question: OnboardingQuestion, onSubmit: @escaping (Any) -> Void) {
        self.question = question
        self.onSubmit = onSubmit
        // Start in the middle
        let min = Double(question.scaleMin ?? 1)
        let max = Double(question.scaleMax ?? 5)
        self._selectedValue = State(initialValue: (min + max) / 2)
    }

    var body: some View {
        VStack(spacing: 32) {
            // Scale visualization
            VStack(spacing: 24) {
                // Value display
                Text(displayValue)
                    .font(.system(size: 48, weight: .light))
                    .foregroundColor(GifterColors.gifterWhite)

                // Slider
                VStack(spacing: 8) {
                    Slider(
                        value: $selectedValue,
                        in: minValue...maxValue,
                        step: 1
                    )
                    .accentColor(GifterColors.gifterWhite)

                    // Labels
                    HStack {
                        Text(question.scaleMinLabel ?? String(Int(minValue)))
                            .gifterCaption()
                            .foregroundColor(GifterColors.gifterGray)

                        Spacer()

                        Text(question.scaleMaxLabel ?? String(Int(maxValue)))
                            .gifterCaption()
                            .foregroundColor(GifterColors.gifterGray)
                    }
                }
            }
            .padding(.horizontal, 24)

            // Scale dots
            HStack(spacing: 8) {
                ForEach(Int(minValue)...Int(maxValue), id: \.self) { value in
                    Circle()
                        .fill(Double(value) <= selectedValue ? GifterColors.gifterWhite : GifterColors.gifterSoftGray)
                        .frame(width: 12, height: 12)
                        .onTapGesture {
                            withAnimation(.easeOut(duration: 0.2)) {
                                selectedValue = Double(value)
                            }
                        }
                }
            }

            // Continue button
            GifterButton(title: "Continue", style: .primary) {
                onSubmit(Int(selectedValue))
            }
            .padding(.horizontal, 24)
        }
        .padding(.horizontal, 24)
    }

    private var displayValue: String {
        String(Int(selectedValue))
    }
}
