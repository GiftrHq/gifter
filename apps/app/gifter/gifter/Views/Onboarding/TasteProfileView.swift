//
//  TasteProfileView.swift
//  gifter
//
//  Taste Profile Flow (User & Non-User)
//

import SwiftUI

enum TasteProfileMode {
    case userDeep
    case userLight
    case nonUser
}

struct TasteProfileView: View {
    let mode: TasteProfileMode
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss

    @State private var currentQuestionIndex = 0
    @State private var selectedStyle: String?
    @State private var selectedEvening: String?
    @State private var selectedInterests: [String] = []
    @State private var isComplete = false

    private let questions: [TasteQuestion] = [
        TasteQuestion(
            title: "How would you describe your everyday style?",
            hint: "No pressure — you can always change this later.",
            options: [
                "Minimal & clean",
                "Cozy & soft",
                "Bold & playful",
                "Eclectic, a bit of everything",
                "I'd rather you decide"
            ]
        ),
        TasteQuestion(
            title: "Which of these feels most like a perfect evening?",
            hint: nil,
            options: [
                "Hosting friends at home",
                "A quiet night in with a book",
                "Trying a new restaurant",
                "Out late, loud music, full energy"
            ]
        ),
        TasteQuestion(
            title: "Pick a few interests that resonate",
            hint: "Select as many as you like.",
            options: [
                "Coffee",
                "Reading",
                "Cooking",
                "Design",
                "Nature",
                "Wellness",
                "Music",
                "Art"
            ],
            multiSelect: true
        )
    ]

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            if isComplete {
                completionView
            } else {
                questionView
            }
        }
        .navigationBarBackButtonHidden(true)
    }

    private var questionView: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                // Top navigation bar
                HStack {
                    Button(action: {
                        if currentQuestionIndex > 0 {
                            withAnimation(.easeOut(duration: 0.3)) {
                                currentQuestionIndex -= 1
                            }
                        } else {
                            dismiss()
                        }
                    }) {
                        Image(systemName: "chevron.left")
                            .foregroundColor(GifterColors.gifterWhite)
                            .font(.system(size: 18))
                            .frame(width: 44, height: 44)
                    }

                    Spacer()

                    Text("Step \(currentQuestionIndex + 1) of \(questions.count)")
                        .gifterCaption()
                        .textCase(.uppercase)

                    Spacer()

                    Color.clear
                        .frame(width: 44, height: 44)
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                .frame(height: 60)

                // Main content area - fills remaining space
                VStack(spacing: 0) {
                    Spacer()

                    VStack(spacing: 40) {
                        VStack(spacing: 16) {
                            Text(questions[currentQuestionIndex].title)
                                .gifterDisplayL()
                                .multilineTextAlignment(.center)
                                .fixedSize(horizontal: false, vertical: true)

                            if let hint = questions[currentQuestionIndex].hint {
                                Text(hint)
                                    .gifterCaption()
                                    .multilineTextAlignment(.center)
                            }
                        }
                        .padding(.horizontal, 32)

                        optionsView
                    }

                    Spacer()
                }
                .transition(.asymmetric(
                    insertion: .opacity.combined(with: .offset(x: 50)),
                    removal: .opacity.combined(with: .offset(x: -50))
                ))
                .id(currentQuestionIndex)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
        }
        .ignoresSafeArea(edges: .bottom)
    }

    @ViewBuilder
    private var optionsView: some View {
        let question = questions[currentQuestionIndex]

        VStack(alignment:.center, spacing: 12) {
            ForEach(question.options, id: \.self) { option in
                let isSelected = question.multiSelect ?
                    selectedInterests.contains(option) :
                    (currentQuestionIndex == 0 ? selectedStyle == option : selectedEvening == option)

                GifterPill(
                    text: option,
                    style: .outlined,
                    isSelected: isSelected
                ) {
                    handleSelection(option, multiSelect: question.multiSelect)
                }
            }

            if question.multiSelect && !selectedInterests.isEmpty {
                GifterButton(title: "Continue", style: .primary) {
                    nextQuestion()
                }
                .padding(.top, 16)
            }
        }
        .padding(.horizontal, 24)
    }

    private var completionView: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                Spacer()

                VStack(spacing: 24) {
                    Text("Got it. I'm on your wavelength.")
                        .gifterDisplayL()
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)

                    Text("I'll use this anytime you ask me to find something — for you, or for someone you love.")
                        .gifterBody()
                        .foregroundColor(GifterColors.gifterGray)
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(.horizontal, 32)

                Spacer()

                GifterButton(title: "Take me home", style: .primary) {
                    completeTasteProfile()
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 60)
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
        }
        .ignoresSafeArea(edges: .bottom)
    }

    private func handleSelection(_ option: String, multiSelect: Bool) {
        if multiSelect {
            if selectedInterests.contains(option) {
                selectedInterests.removeAll { $0 == option }
            } else {
                selectedInterests.append(option)
            }
        } else {
            if currentQuestionIndex == 0 {
                selectedStyle = option
            } else {
                selectedEvening = option
            }
            nextQuestion()
        }
    }

    private func nextQuestion() {
        withAnimation(.easeOut(duration: 0.3)) {
            if currentQuestionIndex < questions.count - 1 {
                currentQuestionIndex += 1
            } else {
                isComplete = true
            }
        }
    }

    private func completeTasteProfile() {
        let tasteProfile = TasteProfile(
            style: selectedStyle,
            perfectEvening: selectedEvening,
            interests: selectedInterests,
            completedAt: Date()
        )

        appState.completeOnboarding(tasteProfile: tasteProfile)
        dismiss()
    }
}

struct TasteQuestion {
    let title: String
    let hint: String?
    let options: [String]
    var multiSelect: Bool = false
}
