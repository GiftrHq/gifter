//
//  DynamicOnboardingView.swift
//  gifter
//
//  Dynamic Onboarding Flow with API-driven questions
//

import SwiftUI

struct DynamicOnboardingView: View {
    @EnvironmentObject var appState: AppState
    @Environment(\.dismiss) var dismiss
    @StateObject private var viewModel = OnboardingViewModel()

    let scenario: OnboardingScenario

    init(scenario: OnboardingScenario = .newUser) {
        self.scenario = scenario
    }

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            if viewModel.isLoading && viewModel.session == nil {
                loadingView
            } else if viewModel.isComplete {
                completionView
            } else if let question = viewModel.currentQuestion {
                questionView(question)
            } else if let error = viewModel.errorMessage {
                errorView(error)
            }
        }
        .navigationBarBackButtonHidden(true)
        .task {
            await viewModel.startOnboarding(scenario: scenario)
        }
    }

    // MARK: - Loading View

    private var loadingView: some View {
        VStack(spacing: 24) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: GifterColors.gifterWhite))
                .scaleEffect(1.5)

            Text("Preparing your questions...")
                .gifterBody()
                .foregroundColor(GifterColors.gifterGray)
        }
    }

    // MARK: - Question View

    private func questionView(_ question: OnboardingQuestion) -> some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                // Top navigation bar
                navigationBar

                // Main content area
                VStack(spacing: 0) {
                    Spacer()

                    VStack(spacing: 40) {
                        // Question header
                        VStack(spacing: 16) {
                            Text(question.question)
                                .gifterDisplayL()
                                .multilineTextAlignment(.center)
                                .fixedSize(horizontal: false, vertical: true)

                            if let description = question.description {
                                Text(description)
                                    .gifterCaption()
                                    .multilineTextAlignment(.center)
                            }
                        }
                        .padding(.horizontal, 32)

                        // Question content based on type
                        questionContent(question)
                    }

                    Spacer()
                }
                .transition(.asymmetric(
                    insertion: .opacity.combined(with: .offset(x: 50)),
                    removal: .opacity.combined(with: .offset(x: -50))
                ))
                .id(viewModel.currentIndex)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
        }
        .ignoresSafeArea(edges: .bottom)
    }

    private var navigationBar: some View {
        HStack {
            Button(action: {
                if viewModel.currentIndex > 0 {
                    viewModel.goBack()
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

            Text(viewModel.stepText)
                .gifterCaption()
                .textCase(.uppercase)

            Spacer()

            // Progress indicator
            CircularProgressView(progress: viewModel.progress)
                .frame(width: 44, height: 44)
        }
        .padding(.horizontal, 20)
        .padding(.top, 16)
        .frame(height: 60)
    }

    @ViewBuilder
    private func questionContent(_ question: OnboardingQuestion) -> some View {
        switch question.type {
        case .multipleChoice:
            MultipleChoiceQuestionView(question: question) { answer in
                Task {
                    _ = await viewModel.submitAnswer(answer)
                }
            }

        case .scale:
            ScaleQuestionView(question: question) { answer in
                Task {
                    _ = await viewModel.submitAnswer(answer)
                }
            }

        case .thisOrThat:
            ThisOrThatQuestionView(question: question) { answer in
                Task {
                    _ = await viewModel.submitAnswer(answer)
                }
            }

        case .shortText:
            ShortTextQuestionView(question: question) { answer in
                Task {
                    _ = await viewModel.submitAnswer(answer)
                }
            }
        }
    }

    // MARK: - Completion View

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

                    // Profile summary tags
                    if !viewModel.profileSummary.isEmpty {
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(viewModel.profileSummary, id: \.self) { item in
                                    GifterPill(text: item, style: .outlined)
                                }
                            }
                            .padding(.horizontal, 32)
                        }
                        .padding(.top, 16)
                    }
                }
                .padding(.horizontal, 32)

                Spacer()

                GifterButton(title: "Take me home", style: .primary) {
                    // Create taste profile from summary
                    let tasteProfile = TasteProfile(
                        style: viewModel.profileSummary.first,
                        perfectEvening: nil,
                        interests: Array(viewModel.profileSummary.dropFirst()),
                        completedAt: Date()
                    )
                    appState.completeOnboarding(tasteProfile: tasteProfile)
                    dismiss()
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 60)
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
        }
        .ignoresSafeArea(edges: .bottom)
    }

    // MARK: - Error View

    private func errorView(_ message: String) -> some View {
        VStack(spacing: 24) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(GifterColors.gifterGray)

            Text(message)
                .gifterBody()
                .foregroundColor(GifterColors.gifterGray)
                .multilineTextAlignment(.center)

            GifterButton(title: "Try Again", style: .primary) {
                Task {
                    await viewModel.startOnboarding(scenario: scenario)
                }
            }
            .frame(width: 200)
        }
        .padding(.horizontal, 32)
    }
}

// MARK: - Circular Progress View

struct CircularProgressView: View {
    let progress: Double

    var body: some View {
        ZStack {
            Circle()
                .stroke(GifterColors.gifterSoftGray, lineWidth: 2)

            Circle()
                .trim(from: 0, to: progress)
                .stroke(GifterColors.gifterWhite, lineWidth: 2)
                .rotationEffect(.degrees(-90))
                .animation(.easeOut(duration: 0.3), value: progress)
        }
        .padding(8)
    }
}
