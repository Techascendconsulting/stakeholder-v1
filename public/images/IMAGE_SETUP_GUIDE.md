# Adding Participant Images to Your Meeting View

## 📁 Folder Structure
Place your participant images in: `public/images/participants/`

## 🖼️ Image Naming Convention
Images should be named using the participant's name in lowercase with spaces replaced by hyphens:

- **Sarah Chen** → `sarah-chen.jpg`
- **Mike Johnson** → `mike-johnson.jpg`  
- **Emily Rodriguez** → `emily-rodriguez.jpg`
- **Joy Nadim** → `joy-nadim.jpg`

## 📋 Supported Formats
- `.jpg` (recommended)
- `.jpeg`
- `.png`
- `.webp`

## 📐 Image Requirements
- **Size**: 400x400px or larger
- **Aspect Ratio**: Square (1:1) preferred for circular avatars
- **Quality**: Good resolution for clear display
- **File Size**: Keep under 500KB for fast loading

## 🎯 Expected Results
Once you add the images:

1. **With Images**: Participants will show their actual photos in circular avatars
2. **Without Images**: Participants will show colored initials as fallback
3. **Failed Images**: Automatically falls back to colored initials

## 📝 Example File Structure
```
public/
└── images/
    └── participants/
        ├── sarah-chen.jpg
        ├── mike-johnson.jpg
        ├── emily-rodriguez.jpg
        └── joy-nadim.jpg
```

## 🔄 How It Works
The system will:
1. Look for an image matching the participant's name
2. Try different formats (jpg, jpeg, png, webp)
3. Display the image if found
4. Fall back to colored initials if no image is found

## 🚀 Next Steps
1. Add your participant images to `public/images/participants/`
2. Name them according to the convention above
3. The meeting view will automatically use them!

No code changes needed - just add the images and they'll appear in your meeting view.