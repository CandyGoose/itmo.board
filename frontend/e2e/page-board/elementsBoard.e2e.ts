import { expect, test } from '@playwright/test';

test.use({ storageState: 'storageState.json' });

test.describe('Boars Elements', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.getByText('Untitle-0').click();
    });

    test.describe('Board Tools Elements', () => {
        test('should display the pointer tool', async ({ page }) => {
            const pointerTool = page
                .locator('svg.lucide-mouse-pointer2')
                .locator('..');
            await expect(pointerTool).toBeVisible();
        });

        test('should display the pen tool', async ({ page }) => {
            const penTool = page.locator('svg.lucide-pencil').locator('..');
            await expect(penTool).toBeVisible();
        });

        test('should display the shape tool', async ({ page }) => {
            const squareTool = page.locator('svg.lucide-square').locator('..');
            const circleTool = page.locator('svg.lucide-circle').locator('..');
            await expect(squareTool).toBeVisible();
            await expect(circleTool).toBeVisible();
        });

        test('should display the note tool', async ({ page }) => {
            const noteTool = page
                .locator('svg.lucide-sticky-note')
                .locator('..');
            await expect(noteTool).toBeVisible();
        });

        test('should display the image button', async ({ page }) => {
            const imageButton = page.locator('svg.lucide-image').locator('..');
            await expect(imageButton).toBeVisible();
        });

        test('should display the undo and redo buttons', async ({ page }) => {
            const undoButton = page.locator('svg.lucide-undo2').locator('..');
            const redoButton = page.locator('svg.lucide-redo2').locator('..');
            await expect(undoButton).toBeVisible();
            await expect(redoButton).toBeVisible();
        });

        test('should display the delete button', async ({ page }) => {
            const deleteButton = page
                .locator('svg.lucide-trash2')
                .locator('..');
            await expect(deleteButton).toBeVisible();
        });

        test('should display the layers button', async ({ page }) => {
            const layersButton = page
                .locator('svg.lucide-ellipsis-vertical')
                .locator('..');
            await expect(layersButton).toBeVisible();
            await layersButton.click();

            const bringToFront = page
                .locator('svg.lucide-bring-to-front')
                .locator('..');
            const sendToBack = page
                .locator('svg.lucide-send-to-back')
                .locator('..');
            const arrowUp = page.locator('svg.lucide-arrow-up').locator('..');
            const arrowDown = page
                .locator('svg.lucide-arrow-down')
                .locator('..');

            await expect(bringToFront).toBeVisible();
            await expect(sendToBack).toBeVisible();
            await expect(arrowUp).toBeVisible();
            await expect(arrowDown).toBeVisible();
        });
    });

    test.describe('Board Manage Elements', () => {
        test('should display the logo and move to home', async ({ page }) => {
            const logoLink = page.getByRole('link', { name: 'logo Board' });
            await expect(logoLink).toBeVisible();
            await logoLink.click();

            const nameBoard = page.getByText('Untitle-0');
            await expect(nameBoard).toBeVisible();
        });

        test('should display and edit the board name', async ({ page }) => {
            const boardNameButton = page.getByRole('button', {
                name: 'Untitle-0',
            });
            await expect(boardNameButton).toBeVisible();
            await boardNameButton.click();

            const nameInput = page.getByPlaceholder('Untitle-0');
            await expect(nameInput).toBeVisible();
            await nameInput.fill('New Name');
            await page.getByRole('button', { name: 'Save' }).click();

            await page.goto('/');
            await page.getByLabel('Open organization switcher').click();
            await page.locator('button', { hasText: 'org_name' }).click();

            const renamedBoard = page.getByText('New Name');
            await expect(renamedBoard).toBeVisible();

            await renamedBoard.click();
            await page.getByRole('button', { name: 'New Name' }).click();
            await page.getByPlaceholder('New Name').fill('Untitle-0');
            await page.getByRole('button', { name: 'Save' }).click();
        });

        test('should display the menu', async ({ page }) => {
            const menuButton = page.locator('svg.lucide-menu').locator('..');
            await expect(menuButton).toBeVisible();
            await menuButton.click();

            const copyLink = page.getByRole('menuitem', { name: 'Copy link' });
            const renameItem = page.getByTestId('rename-item');
            const downloadMenu = page.getByTestId('download-sub-menu');
            await expect(copyLink).toBeVisible();
            await expect(renameItem).toBeVisible();
            await expect(downloadMenu).toBeVisible();

            await downloadMenu.hover();
            const downloadAsSVG = page.getByRole('menuitem', {
                name: 'Download as SVG',
            });
            const downloadAsPNG = page.getByRole('menuitem', {
                name: 'Download as PNG',
            });
            const deleteButton = page.getByRole('button', { name: 'Delete' });
            await expect(downloadAsSVG).toBeVisible();
            await expect(downloadAsPNG).toBeVisible();
            await expect(deleteButton).toBeVisible();
        });
    });
});
