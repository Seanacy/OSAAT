import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { ExternalLink } from 'lucide-react'

// WeStackr public Supabase client (read-only via anon key)
const westackrSupabase = createClient(
  'https://tklwlvjufxumkdeeygeq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrbHdsdmp1Znh1bWtkZWV5Z2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MTQyMDIsImV4cCI6MjA5MTE5MDIwMn0.a4Yi7jqiCzEscI1ysobfrJLtYTcGb-LFfCIXOJzceR8'
)

// OSAAT campaign ID on WeStackr
const OSAAT_CAMPAIGN_ID = 'fa2785af-7519-4ed2-bbb1-67f78acf94a7'
const CAMPAIGN_URL = `https://www.westackr.com/campaign/${OSAAT_CAMPAIGN_ID}`

interface PotData {
  totalRaised: number
  operationsReserve: number
  bridgeWorkFund: number
  availableCashout: number
}

export default function PotDisplay() {
  const [pot, setPot] = useState<PotData>({
    totalRaised: 0,
    operationsReserve: 0,
    bridgeWorkFund: 0,
    availableCashout: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPot()
  }, [])

  const fetchPot = async () => {
    try {
      // Read live campaign amount directly from WeStackr's database
      const { data, error } = await westackrSupabase
        .from('campaigns')
        .select('current_amount')
        .eq('id', OSAAT_CAMPAIGN_ID)
        .single()

      if (!error && data) {
        const totalRaised = Number(data.current_amount) || 0
        const operationsReserve = totalRaised * 0.10
        const bridgeWorkFund = totalRaised * 0.12
        const availableCashout = totalRaised * 0.78

        setPot({ totalRaised, operationsReserve, bridgeWorkFund, availableCashout })

        // Sync back to OSAAT's local pot table so Cashout page stays accurate
        await supabase
          .from('westaackr_pot')
          .update({
            total_raised: totalRaised,
            operations_reserve: operationsReserve,
            bridgework_fund: bridgeWorkFund,
            cashout_pot: availableCashout,
            current_cashout_balance: availableCashout,
            last_updated: new Date().toISOString(),
          })
          .not('pot_id', 'is', null) // update the single row
      }
    } catch (error) {
      console.error('Error fetching pot:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Community Pot</h3>

      {loading ? (
        <div className="text-sm text-gray-400 text-center py-2">Loading...</div>
      ) : (
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
      )}

      <a
        href={CAMPAIGN_URL}
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
