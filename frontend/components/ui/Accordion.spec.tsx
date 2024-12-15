import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion'

const renderAccordion = ({
                             type = 'single' as 'single' | 'multiple',
                             items = [
                                 { value: 'item-1', trigger: 'Item 1', content: 'Content for Item 1' },
                                 { value: 'item-2', trigger: 'Item 2', content: 'Content for Item 2' },
                             ],
                             additionalProps = {},
                         } = {}) => {
    return render(
        <Accordion type={type} {...additionalProps}>
            {items.map((item) => (
                <AccordionItem key={item.value} value={item.value}>
                    <AccordionTrigger>{item.trigger}</AccordionTrigger>
                    <AccordionContent>{item.content}</AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}

describe('Accordion Component', () => {
    test('renders Accordion with AccordionItems', () => {
        renderAccordion()

        expect(screen.getByText('Item 1')).toBeInTheDocument()
        expect(screen.getByText('Item 2')).toBeInTheDocument()

        expect(screen.queryByText('Content for Item 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Content for Item 2')).not.toBeInTheDocument()
    })

    test('expands and collapses AccordionItem on trigger click', async () => {
        renderAccordion({
            items: [
                { value: 'item-1', trigger: 'Item 1', content: 'Content for Item 1' },
            ],
        })

        const trigger = screen.getByText('Item 1')
        const contentText = 'Content for Item 1'

        expect(screen.queryByText(contentText)).not.toBeInTheDocument()

        await userEvent.click(trigger)
        expect(screen.getByText(contentText)).toBeVisible()
    })

    test('only one AccordionItem is open at a time in single type', async () => {
        renderAccordion({
            type: 'single',
            items: [
                { value: 'item-1', trigger: 'Item 1', content: 'Content for Item 1' },
                { value: 'item-2', trigger: 'Item 2', content: 'Content for Item 2' },
            ],
        })

        const trigger1 = screen.getByText('Item 1')
        const trigger2 = screen.getByText('Item 2')
        const content1Text = 'Content for Item 1'
        const content2Text = 'Content for Item 2'

        await userEvent.click(trigger1)
        expect(screen.getByText(content1Text)).toBeVisible()
        expect(screen.queryByText(content2Text)).not.toBeInTheDocument()

        await userEvent.click(trigger2)
        expect(screen.queryByText(content1Text)).not.toBeInTheDocument()
        expect(screen.getByText(content2Text)).toBeVisible()
    })

    test('allows multiple AccordionItems to be open in multiple type', async () => {
        renderAccordion({
            type: 'multiple',
            items: [
                { value: 'item-1', trigger: 'Item 1', content: 'Content for Item 1' },
                { value: 'item-2', trigger: 'Item 2', content: 'Content for Item 2' },
            ],
        })

        const trigger1 = screen.getByText('Item 1')
        const trigger2 = screen.getByText('Item 2')
        const content1Text = 'Content for Item 1'
        const content2Text = 'Content for Item 2'

        await userEvent.click(trigger1)
        expect(screen.getByText(content1Text)).toBeVisible()

        await userEvent.click(trigger2)
        expect(screen.getByText(content1Text)).toBeVisible()
        expect(screen.getByText(content2Text)).toBeVisible()
    })

    test('has correct accessibility attributes', () => {
        renderAccordion({
            items: [
                { value: 'item-1', trigger: 'Item 1', content: 'Content for Item 1' },
            ],
        })

        const trigger = screen.getByText('Item 1')
        const content = screen.queryByRole('region')

        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(trigger).toHaveAttribute('aria-controls')

        if (content) {
            expect(content).toHaveAttribute('aria-labelledby')
            expect(content).toHaveAttribute('id')
        }
    })
})
