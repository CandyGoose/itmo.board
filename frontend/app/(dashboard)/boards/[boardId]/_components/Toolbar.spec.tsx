// Toolbar.spec.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Toolbar from './Toolbar';

describe('Toolbar Component', () => {
    const onSelectToolMock = jest.fn();
    const onColorChangeMock = jest.fn();
    const initialColor = '#ff0000';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('calls onColorChange with new color when color picker value changes', () => {
        render(
            <Toolbar
                onSelectTool={onSelectToolMock}
                onColorChange={onColorChangeMock}
                currentColor={initialColor}
            />,
        );

        const newColor = '#00ff00';
        const colorPicker = screen.getByDisplayValue(initialColor);

        fireEvent.change(colorPicker, { target: { value: newColor } });
        expect(onColorChangeMock).toHaveBeenCalledWith(newColor);
    });
});
