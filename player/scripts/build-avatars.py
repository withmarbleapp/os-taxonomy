# Builds the kit's avatar file from the game's player model: one rig, a small
# wardrobe, idle and walk clips, no images (colours are applied in the kit).
import bpy, sys, os
src_dir, anim_dir, out = sys.argv[-3], sys.argv[-2], sys.argv[-1]
KEEP = {'BodyRound_GEO','FacePlane_Eyes','FacePlane_Mouth','AdventureBackpack_TORSO_OUTER_GEO',
 'Bangs_ROUND_GEO','Buzz_ROUND_GEO','CornRows2_ROUND_GEO','Spiky_ROUND_GEO','SpikyBASE_ROUND_GEO',
 'Hoodie_GEO','StripedTshirt_GEO','Tshirt_GEO','Puffer_GEO','DenimJacket_GEO',
 'Jeans_GEO','CargoShorts_GEO','Joggers_GEO','Shorts_GEO','Skirt_GEO',
 'l_Sneaker','r_Sneaker','l_HighTops','R_HighTops','l_Crocs_GEO','r_Crocs_GEO','l_Sandals_GEO','r_Sandals_GEO'}
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=os.path.join(src_dir, 'PlayerModel.fbx'))
rig = next(o for o in bpy.data.objects if o.type == 'ARMATURE')
for o in list(bpy.data.objects):
    if o.type == 'MESH' and o.name not in KEEP:
        bpy.data.objects.remove(o, do_unlink=True)
print('KEPT', sorted(o.name for o in bpy.data.objects if o.type == 'MESH'))
print('BONES', len(rig.data.bones))
if rig.animation_data is None: rig.animation_data_create()
rig.animation_data.action = None
for clip, file in [('idle', 'Player@Idle.fbx'), ('walk', 'Player@Walk.fbx')]:
    before = set(bpy.data.objects); acts = set(bpy.data.actions)
    bpy.ops.import_scene.fbx(filepath=os.path.join(anim_dir, file))
    # The animation files hold the control rig too; the skeleton is the one
    # with the model's bones, named with a namespace the model does not use.
    donor = next(o for o in bpy.data.objects if o not in before and o.type == 'ARMATURE' and len(o.data.bones) == len(rig.data.bones))
    action = donor.animation_data.action
    slot = donor.animation_data.action_slot
    for curve in action.layers[0].strips[0].channelbag(slot).fcurves:
        curve.data_path = curve.data_path.replace('pebble_avatar_rig_v002:', '')
    action.name = clip
    print('CLIP', clip, tuple(action.frame_range), 'slot', slot.name_display if slot else None)
    for o in [o for o in bpy.data.objects if o not in before]:
        bpy.data.objects.remove(o, do_unlink=True)
    track = rig.animation_data.nla_tracks.new(); track.name = clip
    strip = track.strips.new(clip, int(action.frame_range[0]), action); strip.name = clip
    if slot is not None:
        strip.action_slot = slot
    print('STRIP slot', strip.action_slot.name_display if strip.action_slot else None)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_image_format='NONE', export_animations=True,
    export_animation_mode='NLA_TRACKS', export_morph=False, export_skins=True, export_yup=True, export_optimize_animation_size=True)
