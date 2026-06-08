from kivy.app import App
from kivy.uix.label import Label
from kivy.core.window import Window

# Mengatur latar belakang gelap ala Neon
Window.clearcolor = (0.04, 0.04, 0.05, 1)

class UlarNeonApp(App):
    def build(self):
        return Label(
            text='ULAR NEON\n(Versi Python)',
            font_size='30sp',
            color=(0, 0.94, 1, 1) # Warna Cyan Neon
        )

if __name__ == '__main__':
    UlarNeonApp().run()
