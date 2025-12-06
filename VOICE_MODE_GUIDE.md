# Accessibility Voice Mode - User Guide

## Overview
The Accessibility Voice Mode provides comprehensive voice navigation and audio features for the e-commerce site, making it easier for users with visual impairments or those who prefer audio interaction.

## Features

### 1. Global Voice Mode Toggle
**Location:** Sidebar → Accessibility section

- Click the "Voice Mode" button to enable/disable voice features
- When enabled, the button turns green with a confirmation announcement
- When disabled, all voice features are turned off

### 2. Smart Focus Announcements
**Automatically active when Voice Mode is ON**

- Press **TAB** to navigate through interactive elements
- Each focused element (links, buttons, inputs, product cards) will be announced
- The system automatically cancels previous speech to prevent audio overlap
- Works with:
  - Navigation links (Home, Cart, About)
  - Category filters
  - Product cards and buttons
  - Form inputs
  - All interactive elements

**What gets announced:**
- Button names (e.g., "Add to Cart button")
- Link destinations (e.g., "Home link")
- Input field placeholders (e.g., "Search for products input")
- Element text content and aria-labels

### 3. Product Card Audio Controls
**Visible only when Voice Mode is ON**

Each product card displays a "Listen to Description" button with full keyboard support:

#### How to Use:
1. Navigate to any product card using **TAB**
2. Focus on the orange "Listen to Description" button
3. Use keyboard controls:
   - **ENTER** → Start reading the product description
   - **SPACE** → Pause/Resume the current reading
   - **ESCAPE** → Stop reading completely

#### What Gets Read:
- Product name
- Full description
- Price
- Rating and review count (if available)

#### Visual Indicators:
- **Orange button**: Ready to start reading
- **Red pulsing button**: Currently reading
- Stop icon appears when audio is playing

## Keyboard Shortcuts Summary

| Key | Action |
|-----|--------|
| **TAB** | Navigate through elements (announces each element) |
| **ENTER** | Start reading product description |
| **SPACE** | Pause/Resume product description |
| **ESCAPE** | Stop reading |

## Browser Compatibility

### Speech Recognition (Voice Search):
- ✅ Google Chrome
- ✅ Microsoft Edge
- ✅ Safari (limited)
- ❌ Firefox (not supported)

### Speech Synthesis (Voice Mode):
- ✅ All modern browsers support this feature
- Works on desktop and mobile devices

## Tips for Best Experience

1. **Use headphones** for clearer audio in noisy environments
2. **Tab through elements slowly** to hear complete announcements
3. **Enable Voice Mode first** before navigating with TAB
4. **Press ESCAPE** to quickly stop any unwanted speech
5. **Use SPACE** to pause and resume at your own pace

## Accessibility Features Included

- ✅ Full keyboard navigation support
- ✅ Screen reader friendly (aria-labels on all interactive elements)
- ✅ Visual indicators for voice mode status
- ✅ No mouse required for any voice features
- ✅ Smart audio cancellation prevents overlapping speech
- ✅ Clear visual and audio feedback

## Technical Details

- **Voice Mode Context**: React Context API for global state
- **Speech Synthesis API**: Browser-native text-to-speech
- **Focus Tracking**: Global event listener with capture phase
- **Keyboard Events**: Standard HTML5 keyboard API
- **Cleanup**: Automatic speech cancellation on component unmount

## Troubleshooting

**Voice Mode button not working:**
- Refresh the page
- Ensure JavaScript is enabled
- Try a different browser

**Focus announcements not working:**
- Verify Voice Mode is enabled (green button in sidebar)
- Check browser console for errors
- Ensure audio is not muted

**Product description not reading:**
- Make sure Voice Mode is ON
- Try pressing ENTER on the Listen button
- Check if another speech is currently playing (press ESCAPE first)

## Future Enhancements

- [ ] Adjustable speech rate and pitch
- [ ] Language selection for speech synthesis
- [ ] Voice commands for navigation
- [ ] Reading progress indicator
- [ ] Bookmark/resume feature for long descriptions
