import React, { useState } from 'react'
import { isConfigured, synthesizeToBlob, playBlob, resolveVoiceId } from '../../services/elevenLabsTTS'

const ElevenLabsMultiAgentMeeting: React.FC = () => {
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<string>('')

  const testElevenLabsTTS = async () => {
    setIsTesting(true)
    setTestResult('Testing ElevenLabs TTS...')
    
    try {
      // Test configuration
      const configured = isConfigured()
      console.log('🔧 ElevenLabs configured:', configured)
      
      if (!configured) {
        setTestResult('❌ ElevenLabs TTS is not configured. Check your environment variables.')
        return
      }

      // Test voice resolution
      const testStakeholders = [
        { name: 'Jess Morgan', expectedVoice: 'JESS' },
        { name: 'David Thompson', expectedVoice: 'DAVID' },
        { name: 'James Walker', expectedVoice: 'JAMES' },
        { name: 'Emily Johnson', expectedVoice: 'EMILY' }
      ]

      let voiceTestResults = '🎤 Voice Resolution Test:\n'
      
      for (const stakeholder of testStakeholders) {
        const voiceId = resolveVoiceId(stakeholder.name)
        voiceTestResults += `${stakeholder.name}: ${voiceId ? '✅' : '❌'} ${voiceId || 'No voice ID'}\n`
      }

      setTestResult(voiceTestResults + '\n🎵 Testing audio synthesis...')

      // Test audio synthesis
      const testText = "Hello, this is a test of the ElevenLabs text-to-speech system."
      const audioBlob = await synthesizeToBlob(testText, { stakeholderName: 'Jess Morgan' })
      
      if (audioBlob) {
        setTestResult(voiceTestResults + '\n✅ Audio synthesis successful! Playing test audio...')
        
        // Play the test audio
        await playBlob(audioBlob)
        
        setTimeout(() => {
          setTestResult(voiceTestResults + '\n✅ ElevenLabs TTS is working correctly!')
        }, 3000)
      } else {
        setTestResult(voiceTestResults + '\n❌ Audio synthesis failed - no blob returned')
      }

    } catch (error) {
      console.error('Test error:', error)
      setTestResult(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          ElevenLabs TTS Test
        </h2>
        
        <div className="space-y-4">
          <button
            onClick={testElevenLabsTTS}
            disabled={isTesting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isTesting ? 'Testing...' : 'Test ElevenLabs TTS'}
          </button>
          
          {testResult && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Test Results:</h3>
              <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {testResult}
              </pre>
            </div>
          )}
          
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What this tests:</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• ElevenLabs API key configuration</li>
              <li>• Voice ID resolution for stakeholders</li>
              <li>• Audio synthesis functionality</li>
              <li>• Audio playback</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ElevenLabsMultiAgentMeeting

