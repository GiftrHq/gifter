//
//  MultipleChoiceQuestionView.swift
//  gifter
//
//  Multiple Choice Question Component
//

import SwiftUI

struct MultipleChoiceQuestionView: View {
    let question: OnboardingQuestion
    let onSubmit: (Any) -> Void

    @State private var selectedOptions: Set<String> = []

    private var isMultiSelect: Bool {
        // Check if question allows multiple selections
        question.question.lowercased().contains("select") ||
        question.question.lowercased().contains("pick") ||
        question.question.lowercased().contains("choose")
    }

    var body: some View {
        VStack(alignment: .center, spacing: 12) {
            ForEach(question.options, id: \.id) { option in
                let isSelected = selectedOptions.contains(option.id)

                OptionPill(
                    label: option.label,
                    description: option.description,
                    isSelected: isSelected
                ) {
                    handleSelection(option.id)
                }
            }

            // Continue button for multi-select
            if isMultiSelect && !selectedOptions.isEmpty {
                GifterButton(title: "Continue", style: .primary) {
                    onSubmit(Array(selectedOptions))
                }
                .padding(.top, 16)
            }
        }
        .padding(.horizontal, 24)
    }

    private func handleSelection(_ optionId: String) {
        if isMultiSelect {
            if selectedOptions.contains(optionId) {
                selectedOptions.remove(optionId)
            } else {
                selectedOptions.insert(optionId)
            }
        } else {
            // Single select - submit immediately
            onSubmit(optionId)
        }
    }
}

// MARK: - Option Pill Component

struct OptionPill: View {
    let label: String
    let description: String?
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: {
            let impactMed = UIImpactFeedbackGenerator(style: .light)
            impactMed.impactOccurred()
            action()
        }) {
            HStack(spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(label)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(isSelected ? GifterColors.gifterBlack : GifterColors.gifterWhite)

                    if let description = description {
                        Text(description)
                            .font(.system(size: 13))
                            .foregroundColor(isSelected ? GifterColors.gifterBlack.opacity(0.7) : GifterColors.gifterGray)
                    }
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(GifterColors.gifterBlack)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .frame(maxWidth: .infinity)
            .background(isSelected ? GifterColors.gifterWhite : Color.clear)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(
                        isSelected ? GifterColors.gifterWhite : GifterColors.gifterSoftGray,
                        lineWidth: 1
                    )
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}
