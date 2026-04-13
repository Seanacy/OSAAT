import { useState } from 'react'
import { ExternalLink } from 'lucide-react'

interface PotData {
  totalRaised: number
  operationsReserve: number
  bridgeWorkFund: number
  availableCashout: number
}

export default function PotDisplay() {
  const [pot] = useState<PotData>({
    totalRaised: 50000,
    operationsReserve: 5000,
    bridgeWorkFund: 6000,
    availableCashout: 39000,
  })

  // In a real app, this would fetch from Supabase
  // useEffect(() => {
  //   const fetchPot = async () => {
  //     const { data, error } = await supabase
  //       .from('pot_balance')
  //       .select('*')
  //       .single()
  //     if (!error) setPot(data)
  //   }
  //   fetchPot()
  // }, [])

  return (
    <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Community Pot</h3>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Total Raised</span>
          <span className="font-semibold text-gray-900">${pot.totalRaised.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Operations (10%)</span>
          <span className="font-semibold text-gray-900">${pot.operationsReserve.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 flex items-center gap-1">
            BridgeWork Fund (12%)
            <a
              href="https://bridgework.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-600 hover:text-accent-700"
            >
              <ExternalLink size={14} />
            </a>
          </span>
          <span className="font-semibold text-gray-900">${pot.bridgeWorkFund.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Available Cashout (78%)</span>
          <span className="font-bold text-primary-600">${pot.availableCashout.toLocaleString()}</span>
        </div>
      </div>

      <a
        href="https://weStackr.com/osaat"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm font-semibold text-accent-600 hover:text-accent-700 transition-colors"
      >
        View WeStackr Campaign
        <ExternalLink size={14} />
      </a>
    </div>
  )
}
