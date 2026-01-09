import { ProductVariant } from '@/lib/types/payload'

interface VariantListProps {
    variants: ProductVariant[]
    currencySymbol: string
    onEdit: (variant: ProductVariant) => void
    onDelete: (variantId: string) => void
}

export function VariantList({ variants, currencySymbol, onEdit, onDelete }: VariantListProps) {
    if (variants.length === 0) {
        return (
            <div className="rounded-lg border border-dashed border-panelGray p-8 text-center">
                <p className="text-sm text-panelGray">No variants added yet</p>
            </div>
        )
    }

    return (
        <div className="overflow-hidden rounded-lg border border-panelSoftGray">
            <table className="w-full text-left text-sm">
                <thead className="bg-panelSoftGray/20 text-xs uppercase text-panelGray">
                    <tr>
                        <th className="px-4 py-3 font-medium">Options</th>
                        <th className="px-4 py-3 font-medium">SKU</th>
                        <th className="px-4 py-3 font-medium">Price</th>
                        <th className="px-4 py-3 font-medium">Stock</th>
                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-panelSoftGray">
                    {variants.map((variant) => (
                        <tr key={variant.id} className="group hover:bg-panelSoftGray/10">
                            <td className="px-4 py-3">
                                <div className="flex gap-2">
                                    {variant.optionValues.map((opt, idx) => (
                                        <span
                                            key={idx}
                                            className="inline-flex items-center rounded bg-panelSoftGray/30 px-2 py-1 text-xs text-panelWhite"
                                        >
                                            <span className="mr-1 text-panelGray">{opt.option}:</span>
                                            {opt.value}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-panelGray">{variant.sku}</td>
                            <td className="px-4 py-3">
                                {currencySymbol}
                                {variant.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">
                                {variant.stock === undefined || variant.stock === null ? (
                                    <span className="text-panelGray">∞</span>
                                ) : (
                                    variant.stock
                                )}
                            </td>
                            <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={() => onEdit(variant)}
                                        className="text-panelGray hover:text-panelWhite"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(variant.id)}
                                        className="text-red-500 hover:text-red-400"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
