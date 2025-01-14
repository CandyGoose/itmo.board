import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TwoValueInput } from './TwoValueInput';

describe('TwoValueInput Component', () => {
    const defaultProps = {
        label1: 'First Label',
        label2: 'Second Label',
        value1: 10,
        value2: 20,
        onChange1: jest.fn(),
        onChange2: jest.fn(),
        className: 'custom-class',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders without crashing', () => {
        render(<TwoValueInput {...defaultProps} />);
        expect(screen.getByText('First Label')).toBeInTheDocument();
        expect(screen.getByText('Second Label')).toBeInTheDocument();
        const inputs = screen.getAllByRole('textbox');
        expect(inputs).toHaveLength(2);
    });

    test('applies the provided className', () => {
        const { container } = render(<TwoValueInput {...defaultProps} />);
        expect(container.firstChild).toHaveClass('custom-class');
    });

    test('does not fail when className is not provided', () => {
        const props = { ...defaultProps, className: undefined };
        const { container } = render(<TwoValueInput {...props} />);
        expect(container.firstChild).toHaveClass('flex');
        expect(container.firstChild).not.toHaveClass('undefined');
    });

    test('displays the correct initial values', () => {
        render(<TwoValueInput {...defaultProps} />);
        const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
        expect(inputs[0]).toHaveValue(defaultProps.value1.toString());
        expect(inputs[1]).toHaveValue(defaultProps.value2.toString());
    });

    test('calls onChange1 when the first input value changes', () => {
        render(<TwoValueInput {...defaultProps} />);
        const firstInput = screen.getByLabelText(
            'First Label',
        ) as HTMLInputElement;

        fireEvent.change(firstInput, { target: { value: '15' } });

        expect(defaultProps.onChange1).toHaveBeenCalledTimes(1);
        expect(defaultProps.onChange1).toHaveBeenCalledWith(15);
    });

    test('calls onChange2 when the second input value changes', () => {
        render(<TwoValueInput {...defaultProps} />);
        const secondInput = screen.getByLabelText(
            'Second Label',
        ) as HTMLInputElement;

        fireEvent.change(secondInput, { target: { value: '25' } });

        expect(defaultProps.onChange2).toHaveBeenCalledTimes(1);
        expect(defaultProps.onChange2).toHaveBeenCalledWith(25);
    });

    test('handles non-integer and decimal input values correctly', () => {
        render(<TwoValueInput {...defaultProps} />);
        const firstInput = screen.getByLabelText(
            'First Label',
        ) as HTMLInputElement;
        const secondInput = screen.getByLabelText(
            'Second Label',
        ) as HTMLInputElement;

        fireEvent.change(firstInput, { target: { value: '12.34' } });
        fireEvent.change(secondInput, { target: { value: '56.78' } });

        expect(defaultProps.onChange1).toHaveBeenCalledWith(12.34);
        expect(defaultProps.onChange2).toHaveBeenCalledWith(56.78);
    });

    test('handles empty input by passing 0 to onChange handlers', () => {
        render(<TwoValueInput {...defaultProps} />);
        const firstInput = screen.getByLabelText(
            'First Label',
        ) as HTMLInputElement;
        const secondInput = screen.getByLabelText(
            'Second Label',
        ) as HTMLInputElement;

        fireEvent.change(firstInput, { target: { value: '' } });
        fireEvent.change(secondInput, { target: { value: '' } });

        expect(defaultProps.onChange1).toHaveBeenCalledWith(0);
        expect(defaultProps.onChange2).toHaveBeenCalledWith(0);
    });
});
