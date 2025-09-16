import React, { useEffect, useState } from 'react'
import { useApp } from '../../contexts/AppContext'
import { useGlobalAudio } from '../../hooks/useGlobalAudio'
import { motivationAudioService } from '../../services/motivationAudioService'
import { ArrowLeft, Play, Pause, Headphones, Heart, Zap, Target, TrendingUp, Star, Music, Loader2, BarChart3, Clock, Award, Users, BookOpen, CheckCircle, ArrowRight } from 'lucide-react'

interface AudioFile {
  name: string
  url: string
  type: 'talk' | 'music'
  duration?: number
  tags?: string
}


const MotivationPage: React.FC = () => {
  const { setCurrentView } = useApp()
  const { activeTrack, isPlaying, playTrack, stopTrack } = useGlobalAudio()
  const [talks, setTalks] = useState<AudioFile[]>([])
  const [music, setMusic] = useState<AudioFile[]>([])
  const [isLoadingMusic, setIsLoadingMusic] = useState(false)

  // Load music tracks
  const fetchPixabayMusic = async () => {
    setIsLoadingMusic(true)
    
    // Use all available audio files for music collection
    const musicTracks: AudioFile[] = [
      {
        name: "Ambient Background Music",
        url: "/audio/ambient-background.mp3",
        type: 'music',
        duration: 600, // 10 minutes
        tags: "ambient, background, focus, calm"
      },
      {
        name: "Celestial Prayer Music",
        url: "/audio/celestial-prayer-heavenly music-353893.mp3",
        type: 'music',
        duration: 1200, // 20 minutes
        tags: "celestial, prayer, heavenly, peaceful"
      },
      {
        name: "Meditation Sounds",
        url: "/audio/meditation-sounds.mp3",
        type: 'music',
        duration: 1800, // 30 minutes
        tags: "meditation, zen, calm, mindfulness"
      },
      {
        name: "Piano Music",
        url: "/audio/piano-music.mp3",
        type: 'music',
        duration: 2400, // 40 minutes
        tags: "piano, classical, relaxing, instrumental"
      },
      {
        name: "Afrobeat 2026",
        url: "/audio/afrobeat-2026.mp3",
        type: 'music',
        duration: 1500, // 25 minutes
        tags: "afrobeat, energetic, modern, rhythm"
      },
      {
        name: "Gospel Worship",
        url: "/audio/gospel-worship.mp3",
        type: 'music',
        duration: 2000, // 33 minutes
        tags: "gospel, worship, spiritual, uplifting"
      },
      {
        name: "Inner Peace",
        url: "/audio/inner-peace.mp3",
        type: 'music',
        duration: 1800, // 30 minutes
        tags: "peace, calm, meditation, tranquility"
      },
      {
        name: "Choir and Church Organ",
        url: "/audio/choir-and-church-organ.mp3",
        type: 'music',
        duration: 2200, // 37 minutes
        tags: "choir, organ, spiritual, classical"
      },
      {
        name: "Inner Peace (New)",
        url: "/audio/inner-peace-new.mp3",
        type: 'music',
        duration: 1900, // 32 minutes
        tags: "peace, calm, meditation, serenity"
      }
    ]

    setMusic(musicTracks)
    setIsLoadingMusic(false)
  }

  useEffect(() => {
    // Motivation talks - comprehensive collection from all available audio files
    const motivationTalks: AudioFile[] = [
      // AI Generated Motivational Talk
      { name: "Overcoming Overwhelm", url: "/audio/overwhelm.m4a", type: 'talk', duration: 420, tags: "overwhelm, growth, motivation, business analysis, AI generated" },
      // Planning Phase Talks
      { name: "Sarah's Opening Talk", url: "/audio/planning/sarah-opening.mp3", type: 'talk', duration: 300, tags: "planning, opening, introduction" },
      { name: "Lisa's Capacity Discussion", url: "/audio/planning/lisa-capacity.mp3", type: 'talk', duration: 450, tags: "planning, capacity, analysis" },
      { name: "Victor's Goal Setting", url: "/audio/planning/victor-goal.mp3", type: 'talk', duration: 400, tags: "planning, goals, objectives" },
      { name: "Tom's Testing Approach", url: "/audio/planning/tom-attachments.mp3", type: 'talk', duration: 350, tags: "planning, testing, quality" },
      { name: "Srikanth's Technical Insights", url: "/audio/planning/srikanth-capacity.mp3", type: 'talk', duration: 380, tags: "planning, technical, insights" },
      { name: "Sarah's Capacity Planning", url: "/audio/planning/sarah-capacity.mp3", type: 'talk', duration: 420, tags: "planning, capacity, strategy" },
      { name: "Lisa's Password Security", url: "/audio/planning/lisa-password.mp3", type: 'talk', duration: 320, tags: "planning, security, best practices" },
      { name: "Victor's ID Upload Process", url: "/audio/planning/victor-idupload.mp3", type: 'talk', duration: 380, tags: "planning, process, documentation" },
      { name: "Tom's Password Management", url: "/audio/planning/tom-password.mp3", type: 'talk', duration: 340, tags: "planning, security, management" },
      { name: "Srikanth's ID Upload Guide", url: "/audio/planning/srikanth-idupload.mp3", type: 'talk', duration: 360, tags: "planning, guide, documentation" },
      
      // Refinement Phase Talks
      { name: "Bola's Presentation Skills", url: "/audio/refinement/bola-presentation.mp3", type: 'talk', duration: 500, tags: "refinement, presentation, communication" },
      { name: "Sarah's Concluding Thoughts", url: "/audio/refinement/sarah-conclude.mp3", type: 'talk', duration: 420, tags: "refinement, conclusion, summary" },
      { name: "Lisa's Technical Deep Dive", url: "/audio/refinement/lisa-technical.mp3", type: 'talk', duration: 480, tags: "refinement, technical, analysis" },
      { name: "Srikanth's Question Session", url: "/audio/refinement/srikanth-question.mp3", type: 'talk', duration: 360, tags: "refinement, questions, clarification" },
      { name: "Tom's Testing Strategy", url: "/audio/refinement/tom-testing.mp3", type: 'talk', duration: 440, tags: "refinement, testing, strategy" },
      { name: "Victor's Confirmation Process", url: "/audio/refinement/victor-confirm-2.mp3", type: 'talk', duration: 390, tags: "refinement, confirmation, validation" },
      { name: "Bola's Answer Session", url: "/audio/refinement/bola-answer.mp3", type: 'talk', duration: 380, tags: "refinement, answers, Q&A" },
      { name: "Sarah's Goodbye Message", url: "/audio/refinement/sarah-goodbye.mp3", type: 'talk', duration: 280, tags: "refinement, closing, farewell" },
      { name: "Lisa's Email Strategy", url: "/audio/refinement/lisa-email-2.mp3", type: 'talk', duration: 350, tags: "refinement, communication, email" },
      { name: "Srikanth's Response Framework", url: "/audio/refinement/srikanth-response.mp3", type: 'talk', duration: 400, tags: "refinement, framework, responses" }
    ]

    setTalks(motivationTalks)
    
    // Fetch music tracks
    fetchPixabayMusic()
  }, [])

  const handlePlay = async (src: string, title: string, type: 'talk' | 'music') => {
    try {
      // For all audio, use global audio service
      playTrack(src, title)
    } catch (error) {
      console.error('Error playing audio:', error)
      alert(`Unable to play: ${title}\n\nAudio may not be available yet.`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="relative bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5 dark:from-indigo-400/10 dark:to-purple-400/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="p-2 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm border border-slate-200 dark:border-gray-600"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  📊 Motivation Analytics
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                  Track your progress, stay energized, and keep moving forward
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">24</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">87%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completion</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">12</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">87%</span>
            </div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Progress Rate</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">Above average completion</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">2.4h</span>
            </div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">Daily Average</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">Consistent learning time</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">12</span>
            </div>
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">Day Streak</h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">Keep the momentum going!</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">5</span>
            </div>
            <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Goals Met</h3>
            <p className="text-sm text-orange-700 dark:text-orange-300">This week's achievements</p>
          </div>
        </div>

        {/* Intro Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-6 shadow-lg">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Your Energy Hub for Refocusing and Recharging
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              When the training feels heavy or your energy dips, come here for a quick boost. 
              Listen to short motivational talks or calming music to refocus and recharge.
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Motivation Talks */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 shadow-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Headphones className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  📢 Motivation Talks
                </h3>
                <p className="text-blue-700 dark:text-blue-300">
                  Short talks to push you through moments of doubt and overwhelm
                </p>
              </div>
            </div>

            {/* Talk Themes */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-3 h-3 text-orange-600" />
                  <span className="font-semibold text-orange-800 dark:text-orange-200 text-sm">Overwhelm</span>
                </div>
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  "Growth always feels heavy before it feels easy."
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-1">
                  <Target className="w-3 h-3 text-blue-600" />
                  <span className="font-semibold text-blue-800 dark:text-blue-200 text-sm">Consistency</span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  "Discipline outlasts motivation."
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="font-semibold text-green-800 dark:text-green-200 text-sm">Salary Vision</span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300">
                  "Your next paycheck belongs to the person you're becoming."
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center space-x-2 mb-1">
                  <Star className="w-3 h-3 text-purple-600" />
                  <span className="font-semibold text-purple-800 dark:text-purple-200 text-sm">Resilience</span>
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  "Every rejection is rehearsal for your success."
                </p>
              </div>
            </div>



            {/* Glassmorphism Talk Cards */}
            <div className="space-y-3">
              {talks.map((talk, index) => (
                <button
                  key={talk.url}
                  onClick={() => handlePlay(talk.url, talk.name, talk.type)}
                  className={`w-full p-4 rounded-2xl text-left transition-all duration-300 backdrop-blur-sm border ${
                    activeTrack?.title === talk.name && isPlaying
                      ? 'bg-gradient-to-r from-blue-500/90 to-purple-600/90 text-white shadow-2xl border-blue-400/50'
                      : 'bg-white/70 dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-800/90 border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {activeTrack?.title === talk.name && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <div>
                        <span className="font-medium text-sm">{talk.name}</span>
                        {talk.duration && (
                          <p className="text-xs opacity-75">
                            {Math.floor(talk.duration / 60)}:{(talk.duration % 60).toString().padStart(2, '0')}
                          </p>
                        )}
                      </div>
                    </div>
                    {activeTrack?.title === talk.name && isPlaying ? (
                      <span className="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-medium animate-pulse">
                        Now Playing
                      </span>
                    ) : index === 0 ? (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                        Today's Talk
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Music for Focus */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-8 shadow-lg border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <Music className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  🎵 Music for Focus
                </h3>
                <p className="text-emerald-700 dark:text-emerald-300">
                  Calming background music that loops continuously while you learn
                </p>
              </div>
            </div>

            {isLoadingMusic ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-green-600 mr-3" />
                <span className="text-gray-600 dark:text-gray-400">Loading music tracks...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {music.map((track) => (
                  <button
                    key={track.url}
                    onClick={() => handlePlay(track.url, track.name, track.type)}
                    className={`w-full p-4 rounded-2xl text-left transition-all duration-300 backdrop-blur-sm border ${
                      activeTrack?.title === track.name && isPlaying
                        ? 'bg-gradient-to-r from-emerald-500/90 to-teal-600/90 text-white shadow-2xl border-emerald-400/50'
                        : 'bg-white/70 dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-800/90 border-white/20 dark:border-gray-700/50 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {activeTrack?.title === track.name && isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <div>
                          <span className="font-medium text-sm">{track.name}</span>
                          {track.duration && (
                            <p className="text-xs opacity-75">
                              {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                            </p>
                          )}
                        </div>
                      </div>
                      {activeTrack?.title === track.name && isPlaying ? (
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-white/20 text-white rounded-full text-xs font-medium animate-pulse">
                            Now Playing
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              stopTrack()
                            }}
                            className="px-2 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                          >
                            Stop
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  )
}

export default MotivationPage
