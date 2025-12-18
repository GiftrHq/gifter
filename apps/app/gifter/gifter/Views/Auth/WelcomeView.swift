//
//  WelcomeView.swift
//  gifter
//
//  Welcome Screen (Unauthenticated)
//

import SwiftUI

struct WelcomeView: View {
    @State private var showTitle = false
    @State private var showBody = false
    @State private var showButtons = false
    @State private var showSignup = false
    @State private var showLogin = false

    var body: some View {
        NavigationStack {
            ZStack {
                GifterColors.gifterBlack
                    .ignoresSafeArea()

                VStack(spacing: 0) {
                    Spacer()

                    VStack(spacing: 24) {
                        VStack(spacing: 8) {
                            GifterLogo(size: 75)

                            Text("Gifter")
                                .font(.custom("PlayfairDisplay-Regular", size: 24))
                                .foregroundColor(GifterColors.gifterWhite)
                        }
                        .opacity(showTitle ? 1 : 0)
                        .offset(y: showTitle ? 0 : 10)

                        if showBody {
                            VStack(spacing: 16) {
                                Text("Hello, I'm Gifter.")
                                    .gifterDisplayL()
                                    .multilineTextAlignment(.center)

                                Text("I help you find gifts that feel exactly like them — not just \"that'll do.\"")
                                    .gifterBody()
                                    .multilineTextAlignment(.center)
                                    .foregroundColor(GifterColors.gifterGray)
                            }
                            .transition(.opacity.combined(with: .offset(y: 10)))
                        }
                    }
                    .padding(.horizontal, 32)

                    Spacer()

                    if showButtons {
                        VStack(spacing: 16) {
                            GifterButton(title: "Sign up", style: .primary) {
                                showSignup = true
                            }

                            Button(action: {
                                showLogin = true
                            }) {
                                Text("Log in")
                                    .gifterBody()
                                    .underline()
                            }

                            Text("You'll be able to save wishlists, remember occasions, and pick up where you left off.")
                                .gifterCaption()
                                .multilineTextAlignment(.center)
                                .padding(.top, 8)
                        }
                        .padding(.horizontal, 32)
                        .transition(.opacity.combined(with: .offset(y: 10)))
                    }

                    Spacer()
                        .frame(height: 60)
                }
            }
            .navigationDestination(isPresented: $showSignup) {
                SignupView()
            }
            .navigationDestination(isPresented: $showLogin) {
                LoginView()
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.4)) {
                showTitle = true
            }

            DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
                withAnimation(.easeOut(duration: 0.4)) {
                    showBody = true
                }
            }

            DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
                withAnimation(.easeOut(duration: 0.4)) {
                    showButtons = true
                }
            }
        }
    }
}
