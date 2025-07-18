import jsPDF from 'jspdf'
import { Message } from '../types'

interface MeetingExportData {
  title: string
  project: {
    name: string
    description?: string
  }
  participants: Array<{
    name: string
    role: string
    department?: string
  }>
  date: string
  duration: string
  meetingNotes: string
  rawChat: Message[]
  analytics?: {
    effectivenessScore?: number
    collaborationIndex?: number
    topicsDiscussed?: string[]
    participationBalance?: Record<string, number>
    keyInsights?: string[]
  }
}

export class PDFExportService {
  private static formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  private static addHeader(doc: jsPDF, title: string): number {
    doc.setFontSize(20)
    doc.setFont(undefined, 'bold')
    doc.text(title, 20, 30)
    
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100)
    doc.text(`Generated on ${this.formatDate(new Date().toISOString())}`, 20, 40)
    
    doc.setTextColor(0)
    return 50
  }

  private static addSection(doc: jsPDF, title: string, yPosition: number): number {
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.text(title, 20, yPosition)
    return yPosition + 10
  }

  private static addText(doc: jsPDF, text: string, yPosition: number, maxWidth = 170): number {
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    
    const lines = doc.splitTextToSize(text, maxWidth)
    doc.text(lines, 20, yPosition)
    
    return yPosition + (lines.length * 5) + 5
  }

  private static addPageBreakIfNeeded(doc: jsPDF, currentY: number, neededSpace = 30): number {
    if (currentY + neededSpace > 280) {
      doc.addPage()
      return 20
    }
    return currentY
  }

  static async exportMeetingTranscript(data: MeetingExportData): Promise<void> {
    try {
      const doc = new jsPDF()
      let currentY = this.addHeader(doc, data.title)

      // Meeting Overview
      currentY = this.addPageBreakIfNeeded(doc, currentY)
      currentY = this.addSection(doc, 'Meeting Overview', currentY)
      
      const overviewText = [
        `Project: ${data.project.name}`,
        `Date: ${this.formatDate(data.date)}`,
        `Duration: ${data.duration}`,
        `Participants: ${data.participants.length} stakeholders`
      ].join('\n')
      
      currentY = this.addText(doc, overviewText, currentY)

      // Participants
      currentY = this.addPageBreakIfNeeded(doc, currentY)
      currentY = this.addSection(doc, 'Participants', currentY + 10)
      
      const participantText = data.participants.map(p => 
        `• ${p.name} - ${p.role}${p.department ? ` (${p.department})` : ''}`
      ).join('\n')
      
      currentY = this.addText(doc, participantText, currentY)

      // Meeting Notes Summary
      if (data.meetingNotes) {
        currentY = this.addPageBreakIfNeeded(doc, currentY)
        currentY = this.addSection(doc, 'Meeting Notes Summary', currentY + 10)
        currentY = this.addText(doc, data.meetingNotes, currentY)
      }

      // Analytics (if available)
      if (data.analytics) {
        currentY = this.addPageBreakIfNeeded(doc, currentY)
        currentY = this.addSection(doc, 'Meeting Analytics', currentY + 10)
        
        const analyticsText = [
          data.analytics.effectivenessScore ? `Effectiveness Score: ${data.analytics.effectivenessScore}/100` : '',
          data.analytics.collaborationIndex ? `Collaboration Index: ${data.analytics.collaborationIndex.toFixed(2)}` : '',
          data.analytics.topicsDiscussed?.length ? `Topics Discussed: ${data.analytics.topicsDiscussed.length}` : '',
          data.analytics.keyInsights?.length ? `Key Insights Generated: ${data.analytics.keyInsights.length}` : ''
        ].filter(Boolean).join('\n')
        
        if (analyticsText) {
          currentY = this.addText(doc, analyticsText, currentY)
        }

        // Key Insights
        if (data.analytics.keyInsights?.length) {
          currentY = this.addPageBreakIfNeeded(doc, currentY)
          currentY = this.addSection(doc, 'Key Insights', currentY + 5)
          
          const insightsText = data.analytics.keyInsights.map((insight, index) => 
            `${index + 1}. ${insight}`
          ).join('\n\n')
          
          currentY = this.addText(doc, insightsText, currentY)
        }

        // Participation Balance
        if (data.analytics.participationBalance) {
          currentY = this.addPageBreakIfNeeded(doc, currentY)
          currentY = this.addSection(doc, 'Participation Balance', currentY + 5)
          
          const participationText = Object.entries(data.analytics.participationBalance)
            .map(([name, percentage]) => `• ${name}: ${Math.round(percentage)}%`)
            .join('\n')
          
          currentY = this.addText(doc, participationText, currentY)
        }
      }

      // Raw Chat Transcript
      if (data.rawChat.length > 0) {
        currentY = this.addPageBreakIfNeeded(doc, currentY, 50)
        currentY = this.addSection(doc, 'Complete Conversation Transcript', currentY + 10)
        
        // Add separator line
        doc.setDrawColor(200)
        doc.line(20, currentY, 190, currentY)
        currentY += 10

        for (const message of data.rawChat) {
          currentY = this.addPageBreakIfNeeded(doc, currentY, 25)
          
          // Speaker header
          doc.setFontSize(10)
          doc.setFont(undefined, 'bold')
          
          const speaker = message.speaker === 'user' ? 'Business Analyst' : 
                         message.stakeholderName || message.speaker
          const timestamp = new Date(message.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })
          
          doc.text(`${speaker} (${timestamp})`, 20, currentY)
          currentY += 7
          
          // Message content
          doc.setFont(undefined, 'normal')
          currentY = this.addText(doc, message.content, currentY)
          currentY += 5
        }
      }

      // Footer on last page
      const pageCount = doc.getNumberOfPages()
      doc.setPage(pageCount)
      doc.setFontSize(8)
      doc.setTextColor(100)
      doc.text(
        'Generated by Stakeholder AI Meeting System', 
        20, 
        290
      )
      doc.text(
        `Page ${pageCount} of ${pageCount}`, 
        170, 
        290
      )

      // Generate filename
      const projectName = data.project.name.replace(/[^a-zA-Z0-9]/g, '_')
      const date = new Date(data.date).toISOString().split('T')[0]
      const filename = `${projectName}_Meeting_${date}.pdf`

      // Save the PDF
      doc.save(filename)
      
      console.log(`PDF exported successfully: ${filename}`)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      throw new Error('Failed to export meeting transcript as PDF')
    }
  }

  static async exportMeetingNotes(
    title: string,
    content: string,
    metadata: {
      project: string
      date: string
      participants: string[]
    }
  ): Promise<void> {
    try {
      const doc = new jsPDF()
      let currentY = this.addHeader(doc, title)

      // Metadata
      currentY = this.addSection(doc, 'Meeting Information', currentY)
      const metadataText = [
        `Project: ${metadata.project}`,
        `Date: ${this.formatDate(metadata.date)}`,
        `Participants: ${metadata.participants.join(', ')}`
      ].join('\n')
      currentY = this.addText(doc, metadataText, currentY)

      // Content
      currentY = this.addSection(doc, 'Meeting Notes', currentY + 10)
      this.addText(doc, content, currentY)

      // Generate filename
      const projectName = metadata.project.replace(/[^a-zA-Z0-9]/g, '_')
      const date = new Date(metadata.date).toISOString().split('T')[0]
      const filename = `${projectName}_Notes_${date}.pdf`

      doc.save(filename)
      console.log(`Meeting notes PDF exported: ${filename}`)
    } catch (error) {
      console.error('Error exporting meeting notes PDF:', error)
      throw new Error('Failed to export meeting notes as PDF')
    }
  }
}