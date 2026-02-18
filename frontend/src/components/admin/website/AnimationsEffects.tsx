import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Sparkles, Play, Zap, MousePointer } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function AnimationsEffects() {
  const [loading, setLoading] = useState(false);
  const [animations, setAnimations] = useState({
    enabled: true,
    duration: 300,
    scrollAnimations: true,
    hoverEffects: true,
    pageTransitions: true,
    loadingAnimations: true,
    parallaxEffect: false,
    smoothScroll: true,
    cursorEffects: false,
    easing: 'ease-out',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.getAdminSiteSettings();
      if (res.success && res.data?.animations) {
        setAnimations(prev => ({
          ...prev,
          enabled: res.data.animations.enabled ?? true,
          duration: res.data.animations.durationMs || 300,
        }));
      }
    } catch (e) {

    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.updateAdminSiteSettings({
        animations: {
          enabled: animations.enabled,
          durationMs: animations.duration,
        }
      });
      toast.success('Animation settings saved');
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Animations & Effects</h2>
          <p className="text-muted-foreground">Configure motion and visual effects</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Master Toggle */}
      <Card className={!animations.enabled ? 'opacity-60' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <CardTitle>Enable Animations</CardTitle>
            </div>
            <Switch
              checked={animations.enabled}
              onCheckedChange={(c) => setAnimations({ ...animations, enabled: c })}
            />
          </div>
          <CardDescription>Master toggle for all animations and effects</CardDescription>
        </CardHeader>
      </Card>

      <div className={`grid gap-6 md:grid-cols-2 ${!animations.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Animation Timing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Animation Timing
            </CardTitle>
            <CardDescription>Control animation speed and easing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Animation Duration</Label>
                <span className="text-sm text-muted-foreground">{animations.duration}ms</span>
              </div>
              <Slider
                value={[animations.duration]}
                onValueChange={([v]) => setAnimations({ ...animations, duration: v })}
                min={100}
                max={1000}
                step={50}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fast</span>
                <span>Normal</span>
                <span>Slow</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Easing Function</Label>
              <Select value={animations.easing} onValueChange={(v) => setAnimations({ ...animations, easing: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="ease">Ease</SelectItem>
                  <SelectItem value="ease-in">Ease In</SelectItem>
                  <SelectItem value="ease-out">Ease Out</SelectItem>
                  <SelectItem value="ease-in-out">Ease In-Out</SelectItem>
                  <SelectItem value="bounce">Bounce</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Animation Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Animation Types
            </CardTitle>
            <CardDescription>Enable specific animation effects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Scroll Animations</Label>
                <p className="text-xs text-muted-foreground">Animate elements on scroll</p>
              </div>
              <Switch
                checked={animations.scrollAnimations}
                onCheckedChange={(c) => setAnimations({ ...animations, scrollAnimations: c })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Hover Effects</Label>
                <p className="text-xs text-muted-foreground">Interactive hover states</p>
              </div>
              <Switch
                checked={animations.hoverEffects}
                onCheckedChange={(c) => setAnimations({ ...animations, hoverEffects: c })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Page Transitions</Label>
                <p className="text-xs text-muted-foreground">Smooth page changes</p>
              </div>
              <Switch
                checked={animations.pageTransitions}
                onCheckedChange={(c) => setAnimations({ ...animations, pageTransitions: c })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Loading Animations</Label>
                <p className="text-xs text-muted-foreground">Spinners and skeletons</p>
              </div>
              <Switch
                checked={animations.loadingAnimations}
                onCheckedChange={(c) => setAnimations({ ...animations, loadingAnimations: c })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Effects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer className="w-5 h-5" />
              Advanced Effects
            </CardTitle>
            <CardDescription>Special visual effects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Parallax Effect</Label>
                <p className="text-xs text-muted-foreground">Depth scrolling effect</p>
              </div>
              <Switch
                checked={animations.parallaxEffect}
                onCheckedChange={(c) => setAnimations({ ...animations, parallaxEffect: c })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Smooth Scroll</Label>
                <p className="text-xs text-muted-foreground">Smooth scrolling behavior</p>
              </div>
              <Switch
                checked={animations.smoothScroll}
                onCheckedChange={(c) => setAnimations({ ...animations, smoothScroll: c })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Custom Cursor</Label>
                <p className="text-xs text-muted-foreground">Animated cursor effects</p>
              </div>
              <Switch
                checked={animations.cursorEffects}
                onCheckedChange={(c) => setAnimations({ ...animations, cursorEffects: c })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See animations in action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full transition-all"
                style={{ 
                  transitionDuration: `${animations.duration}ms`,
                  transitionTimingFunction: animations.easing,
                }}
              >
                Hover me to see effect
              </Button>
              <div 
                className="h-20 bg-primary/10 rounded-lg flex items-center justify-center animate-pulse"
                style={{ animationDuration: `${animations.duration * 5}ms` }}
              >
                <Sparkles className="w-6 h-6 text-primary animate-spin" style={{ animationDuration: `${animations.duration * 10}ms` }} />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Duration: {animations.duration}ms | Easing: {animations.easing}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
