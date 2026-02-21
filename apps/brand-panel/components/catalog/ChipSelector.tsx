'use client'

import { motion } from 'framer-motion'

interface Option {
    label: string
    value: string
}

interface ChipSelectorProps {
    options: Option[]
    selectedValues: string[]
    onChange: (values: string[]) => void
    label?: string
}

export function ChipSelector({ options, selectedValues, onChange, label }: ChipSelectorProps) {
    const toggleOption = (value: string) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter((v) => v !== value))
        } else {
            onChange([...selectedValues, value])
        }
    }

    return (
        <div className="space-y-3">
            {label && <label className="label block">{label}</label>}
            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const isSelected = selectedValues.includes(option.value)

                    return (
                        <motion.button
                            key={option.value}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleOption(option.value)}
                            className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                border shadow-sm
                ${isSelected
                                    ? 'bg-panelWhite text-panelBlack border-panelWhite'
                                    : 'bg-panelBlack text-panelGray border-panelSoftGray hover:border-panelGray hover:text-panelWhite'
                                }
              `}
                        >
                            {option.label}
                            {isSelected && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="ml-2 inline-flex"
                                >
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </motion.span>
                            )}
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
