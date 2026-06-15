import React from 'react'

export default function CaixaPage({ receita = 0, despesas = 0, capital = 0 }) {
  const lucro = receita - despesas
  const roi = capital > 0 ? (lucro / capital) * 100 : 0

  return (
    <div className="dm-admin-card">
      <h2 className="text-sm font-semibold mb-4">Caixa</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="dm-label">Receita</p>
          <p className="dm-stat-value text-green-400">R$ {Number(receita).toFixed(2)}</p>
        </div>
        <div>
          <p className="dm-label">Despesas</p>
          <p className="dm-stat-value text-red-400">R$ {Number(despesas).toFixed(2)}</p>
        </div>
        <div>
          <p className="dm-label">Lucro / ROI</p>
          <p className="dm-stat-value">R$ {Number(lucro).toFixed(2)} • {roi.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  )
}
