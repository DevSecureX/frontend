import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { DeletionFeedback } from '../DeletionFeedback'

describe('DeletionFeedback', () => {
  it('should render deletion feedback options', () => {
    const mockOnReasonChange = vi.fn()
    
    render(<DeletionFeedback onReasonChange={mockOnReasonChange} />)
    
    // Check if the component renders
    expect(screen.getByText('Help us improve (Optional)')).toBeInTheDocument()
    expect(screen.getByText('No longer needed')).toBeInTheDocument()
    expect(screen.getByText('Cost considerations')).toBeInTheDocument()
  })

  it('should call onReasonChange when a reason is selected', () => {
    const mockOnReasonChange = vi.fn()
    
    render(<DeletionFeedback onReasonChange={mockOnReasonChange} />)
    
    // Click on a radio button
    const noLongerNeededOption = screen.getByLabelText(/No longer needed/)
    fireEvent.click(noLongerNeededOption)
    
    // Should call the callback with the reason text
    expect(mockOnReasonChange).toHaveBeenCalledWith('No longer needed')
  })

  it('should show custom textarea when Other reason is selected', () => {
    const mockOnReasonChange = vi.fn()
    
    render(<DeletionFeedback onReasonChange={mockOnReasonChange} />)
    
    // Click on custom option
    const customOption = screen.getByLabelText(/Other reason/)
    fireEvent.click(customOption)
    
    // Should show textarea
    expect(screen.getByPlaceholderText(/Tell us more about your reason/)).toBeInTheDocument()
  })
})