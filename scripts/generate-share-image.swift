// Optional macOS-only authoring utility. The PNG is committed; deployment only needs Node.js.
import AppKit
let width = 1200, height = 630
let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
let context = NSGraphicsContext(bitmapImageRep: bitmap)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context
func color(_ hex: Int) -> NSColor { NSColor(red: CGFloat((hex >> 16) & 255)/255, green: CGFloat((hex >> 8) & 255)/255, blue: CGFloat(hex & 255)/255, alpha: 1) }
func text(_ string: String, _ x: CGFloat, _ y: CGFloat, _ size: CGFloat, _ weight: NSFont.Weight, _ ink: Int) {
    (string as NSString).draw(at: NSPoint(x:x,y:y),withAttributes:[.font:NSFont.systemFont(ofSize:size,weight:weight),.foregroundColor:color(ink)])
}
color(0xfbfaf6).setFill()
NSBezierPath(rect:NSRect(x:0,y:0,width:width,height:height)).fill()
color(0x17685b).setFill()
NSBezierPath(roundedRect:NSRect(x:62,y:443,width:104,height:104),xRadius:30,yRadius:30).fill()
let spark = NSBezierPath()
spark.move(to:NSPoint(x:119,y:531)); spark.line(to:NSPoint(x:84,y:488)); spark.line(to:NSPoint(x:112,y:488)); spark.line(to:NSPoint(x:106,y:460)); spark.line(to:NSPoint(x:144,y:506)); spark.line(to:NSPoint(x:117,y:506)); spark.close()
color(0xffda82).setFill();spark.fill()
text("azyl.it",190,460,64,.bold,0x243d3b)
text("Apprendre à lire,",64,320,66,.bold,0x243d3b)
text("chacun à son rythme.",64,237,66,.bold,0x17685b)
text("Lettres · Sons · Syllabes",68,158,31,.medium,0x536c60)
text("Jeux en français · Parents et enseignants",68,68,25,.regular,0x536c60)
NSGraphicsContext.restoreGraphicsState()
let png=bitmap.representation(using:.png,properties:[:])!
try png.write(to:URL(fileURLWithPath:"app/social-card.png"))
