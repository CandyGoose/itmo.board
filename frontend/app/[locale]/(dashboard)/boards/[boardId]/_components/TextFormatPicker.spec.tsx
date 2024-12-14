import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextFormatPicker } from './TextFormatPicker';
import { TextFormat, TextAlign } from '@/types/canvas';
import * as Toolbar from '@radix-ui/react-toolbar';

jest.mock('@radix-ui/react-icons', () => ({
    FontBoldIcon: () => <svg data-testid="bold-icon" />,
    FontItalicIcon: () => <svg data-testid="italic-icon" />,
    StrikethroughIcon: () => <svg data-testid="strike-icon" />,
    TextAlignCenterIcon: () => <svg data-testid="align-center-icon" />,
    TextAlignLeftIcon: () => <svg data-testid="align-left-icon" />,
    TextAlignRightIcon: () => <svg data-testid="align-right-icon" />,
}));

describe('TextFormatPicker', () => {
    const mockOnFormatChange = jest.fn();

    const renderComponent = (
        textFormat: TextFormat[] = [],
        textAlign: TextAlign = TextAlign.Left,
        onFormatChange = mockOnFormatChange
    ) => {
        render(
            <Toolbar.Root>
                <TextFormatPicker
                    textFormat={textFormat}
                    textAlign={textAlign}
                    onFormatChange={onFormatChange}
                />
            </Toolbar.Root>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all text formatting buttons', () => {
        renderComponent();

        expect(screen.getByLabelText('Bold')).toBeInTheDocument();
        expect(screen.getByLabelText('Italic')).toBeInTheDocument();
        expect(screen.getByLabelText('Strike Through')).toBeInTheDocument();
    });

    it('renders all text alignment buttons', () => {
        renderComponent();

        expect(screen.getByLabelText('Left Aligned')).toBeInTheDocument();
        expect(screen.getByLabelText('Center Aligned')).toBeInTheDocument();
        expect(screen.getByLabelText('Right Aligned')).toBeInTheDocument();
    });

    it('reflects the correct initial text formatting selection', () => {
        renderComponent([TextFormat.Bold, TextFormat.Italic]);

        const boldButton = screen.getByLabelText('Bold');
        const italicButton = screen.getByLabelText('Italic');
        const strikeButton = screen.getByLabelText('Strike Through');

        expect(boldButton).toHaveAttribute('data-state', 'on');
        expect(italicButton).toHaveAttribute('data-state', 'on');
        expect(strikeButton).toHaveAttribute('data-state', 'off');
    });

    it('reflects the correct initial text alignment selection', () => {
        renderComponent([], TextAlign.Center);

        const leftAlignButton = screen.getByLabelText('Left Aligned');
        const centerAlignButton = screen.getByLabelText('Center Aligned');
        const rightAlignButton = screen.getByLabelText('Right Aligned');

        expect(leftAlignButton).toHaveAttribute('data-state', 'off');
        expect(centerAlignButton).toHaveAttribute('data-state', 'on');
        expect(rightAlignButton).toHaveAttribute('data-state', 'off');
    });

    it('calls onFormatChange with updated textFormat when a formatting button is toggled on', () => {
        renderComponent([], TextAlign.Left);

        const boldButton = screen.getByLabelText('Bold');
        fireEvent.click(boldButton);

        expect(mockOnFormatChange).toHaveBeenCalledWith({
            textFormat: [TextFormat.Bold],
            textAlign: TextAlign.Left,
        });
    });

    it('calls onFormatChange with updated textFormat when a formatting button is toggled off', () => {
        renderComponent([TextFormat.Bold], TextAlign.Left);

        const boldButton = screen.getByLabelText('Bold');
        fireEvent.click(boldButton);

        expect(mockOnFormatChange).toHaveBeenCalledWith({
            textFormat: [],
            textAlign: TextAlign.Left,
        });
    });

    it('calls onFormatChange with updated textAlign when an alignment button is selected', () => {
        renderComponent([], TextAlign.Left);

        const centerAlignButton = screen.getByLabelText('Center Aligned');
        fireEvent.click(centerAlignButton);

        expect(mockOnFormatChange).toHaveBeenCalledWith({
            textFormat: [],
            textAlign: TextAlign.Center,
        });
    });

    it('allows multiple text formatting selections', () => {
        renderComponent([TextFormat.Bold], TextAlign.Left);

        const italicButton = screen.getByLabelText('Italic');
        fireEvent.click(italicButton);

        expect(mockOnFormatChange).toHaveBeenCalledWith({
            textFormat: [TextFormat.Bold, TextFormat.Italic],
            textAlign: TextAlign.Left,
        });
    });

    it('ensures only one text alignment button is selected at a time', () => {
        renderComponent([], TextAlign.Left);

        const centerAlignButton = screen.getByLabelText('Center Aligned');
        const rightAlignButton = screen.getByLabelText('Right Aligned');

        fireEvent.click(centerAlignButton);
        expect(mockOnFormatChange).toHaveBeenCalledWith({
            textFormat: [],
            textAlign: TextAlign.Center,
        });

        fireEvent.click(rightAlignButton);
        expect(mockOnFormatChange).toHaveBeenCalledWith({
            textFormat: [],
            textAlign: TextAlign.Right,
        });
    });

    it('renders the correct number of formatting and alignment buttons', () => {
        renderComponent();

        const formattingButtons = screen.getAllByRole('button', { name: /Bold|Italic|Strike Through/ });
        const alignmentButtons = screen.getAllByRole('radio', { name: /Left Aligned|Center Aligned|Right Aligned/ });

        expect(formattingButtons).toHaveLength(3);
        expect(alignmentButtons).toHaveLength(3);
    });
});
